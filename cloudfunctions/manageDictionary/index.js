// 字典管理云函数
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
        return await getDictionaryList(data)
      case 'create':
        return await createDictionary(data)
      case 'update':
        return await updateDictionary(data)
      case 'delete':
        return await deleteDictionary(data)
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (error) {
    console.error('manageDictionary error:', error)
    return { code: -1, message: '系统错误，请稍后重试' }
  }
}

async function getDictionaryList(filters) {
  try {
    let query = db.collection('dictionaries').where({
      is_active: true
    })
    
    // 应用过滤条件
    if (filters && filters.category) {
      query = query.where({
        category: filters.category
      })
    }
    
    const result = await query.get()
    
    return { code: 0, message: 'success', data: result.data }
  } catch (error) {
    console.error('getDictionaryList error:', error)
    return { code: -1, message: '获取字典列表失败' }
  }
}

async function createDictionary(data) {
  try {
    const dictData = {
      category: data.category,
      code: data.code,
      name: data.name,
      value: data.value,
      is_active: true,
      create_time: new Date(),
      update_time: new Date()
    }
    
    const result = await db.collection('dictionaries').add({
      data: dictData
    })
    
    dictData._id = result._id
    return { code: 0, message: '创建成功', data: dictData }
  } catch (error) {
    console.error('createDictionary error:', error)
    return { code: -1, message: '创建字典失败' }
  }
}

async function updateDictionary(data) {
  try {
    // 更新字典信息
    const updateData = {
      category: data.category,
      code: data.code,
      name: data.name,
      value: data.value,
      is_active: data.is_active,
      update_time: new Date()
    }
    
    await db.collection('dictionaries').doc(data._id).update({
      data: updateData
    })
    
    return { code: 0, message: '更新成功' }
  } catch (error) {
    console.error('updateDictionary error:', error)
    return { code: -1, message: '更新字典失败' }
  }
}

async function deleteDictionary(data) {
  try {
    // 软删除字典（设置为非激活状态）
    await db.collection('dictionaries').doc(data._id).update({
      data: {
        is_active: false,
        update_time: new Date()
      }
    })
    
    return { code: 0, message: '删除成功' }
  } catch (error) {
    console.error('deleteDictionary error:', error)
    return { code: -1, message: '删除字典失败' }
  }
}