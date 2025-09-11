// 模板数据管理云函数
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, data } = event
  
  try {
    switch (action) {
      case 'list':
        return await getTemplateDataList(data)
      case 'create':
        return await createTemplateData(wxContext.OPENID, data)
      case 'update':
        return await updateTemplateData(wxContext.OPENID, data)
      case 'delete':
        return await deleteTemplateData(wxContext.OPENID, data)
      case 'get':
        return await getTemplateData(data)
      default:
        return { code: -1, msg: '未知操作' }
    }
  } catch (error) {
    console.error('manageTemplateData error:', error)
    return { code: -1, msg: '系统错误，请稍后重试' }
  }
}

async function getTemplateDataList(filters) {
  try {
    const { templateType } = filters || {}
    
    let query = db.collection(templateType === 'reward' ? 'reward_templates' : 'task_templates')
    
    // 应用过滤条件
    if (filters) {
      if (filters.createBy) {
        query = query.where({
          createBy: filters.createBy
        })
      }
      
      if (filters.isActive !== undefined) {
        query = query.where({
          isActive: filters.isActive
        })
      }
    }
    
    const result = await query.get()
    
    return { code: 0, msg: 'success', data: result.data }
  } catch (error) {
    console.error('getTemplateDataList error:', error)
    return { code: -1, msg: '获取模板数据列表失败' }
  }
}

async function createTemplateData(openid, data) {
  try {
    const { templateType } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    const templateData = {
      ...data,
      createBy: openid,
      createTime: new Date(),
      updateTime: new Date()
    }
    
    const result = await db.collection(collectionName).add({
      data: templateData
    })
    
    templateData._id = result._id
    return { code: 0, msg: '创建成功', data: templateData }
  } catch (error) {
    console.error('createTemplateData error:', error)
    return { code: -1, msg: '创建模板数据失败' }
  }
}

async function updateTemplateData(openid, data) {
  try {
    const { templateType, _id } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    // 验证权限
    const templateResult = await db.collection(collectionName).doc(_id).get()
    
    if (templateResult.data.length === 0) {
      return { code: -1, msg: '模板数据不存在' }
    }
    
    const template = templateResult.data[0]
    
    if (template.createBy !== openid) {
      return { code: -1, msg: '权限不足' }
    }
    
    // 更新模板数据
    const updateData = {
      ...data,
      updateTime: new Date()
    }
    
    // 删除不需要更新的字段
    delete updateData._id
    delete updateData.templateType
    delete updateData.createBy
    delete updateData.createTime
    
    await db.collection(collectionName).doc(_id).update({
      data: updateData
    })
    
    return { code: 0, msg: '更新成功' }
  } catch (error) {
    console.error('updateTemplateData error:', error)
    return { code: -1, msg: '更新模板数据失败' }
  }
}

async function deleteTemplateData(openid, data) {
  try {
    const { templateType, _id } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    // 验证权限
    const templateResult = await db.collection(collectionName).doc(_id).get()
    
    if (templateResult.data.length === 0) {
      return { code: -1, msg: '模板数据不存在' }
    }
    
    const template = templateResult.data[0]
    
    if (template.createBy !== openid) {
      return { code: -1, msg: '权限不足' }
    }
    
    // 删除模板数据
    await db.collection(collectionName).doc(_id).remove()
    
    return { code: 0, msg: '删除成功' }
  } catch (error) {
    console.error('deleteTemplateData error:', error)
    return { code: -1, msg: '删除模板数据失败' }
  }
}

async function getTemplateData(data) {
  try {
    const { templateType, _id } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    const result = await db.collection(collectionName).doc(_id).get()
    
    if (result.data.length === 0) {
      return { code: -1, msg: '模板数据不存在' }
    }
    
    return { code: 0, msg: 'success', data: result.data[0] }
  } catch (error) {
    console.error('getTemplateData error:', error)
    return { code: -1, msg: '获取模板数据失败' }
  }
}