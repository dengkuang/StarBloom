// 儿童信息管理云函数
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
        return await getChildrenList(wxContext.OPENID)
      case 'create':
        return await createChild(wxContext.OPENID, data)
      case 'update':
        return await updateChild(wxContext.OPENID, data)
      case 'delete':
        return await deleteChild(wxContext.OPENID, data)
      default:
        return { code: -1, msg: '未知操作' }
    }
  } catch (error) {
    console.error('manageChildren error:', error)
    return { code: -1, msg: '系统错误，请稍后重试' }
  }
}

async function getChildrenList(parentId) {
  try {
    const result = await db.collection('children').where({
      parentId: parentId
    }).get()
    
    return { code: 0, msg: 'success', data: result.data }
  } catch (error) {
    console.error('getChildrenList error:', error)
    return { code: -1, msg: '获取儿童列表失败' }
  }
}

async function createChild(parentId, data) {
  try {
    const childData = {
      name: data.name,
      age: data.age || 0,
      avatar: data.avatar || '',
      parentId: parentId,
      totalPoints: 0,
      totalEarnedPoints: 0,
      totalConsumedPoints: 0,
      createTime: new Date(),
      updateTime: new Date()
    }
    
    const result = await db.collection('children').add({
      data: childData
    })
    
    childData._id = result._id
    return { code: 0, msg: '创建成功', data: childData }
  } catch (error) {
    console.error('createChild error:', error)
    return { code: -1, msg: '创建儿童信息失败' }
  }
}

async function updateChild(parentId, data) {
  try {
    // 验证权限
    const childResult = await db.collection('children').where({
      _id: data._id,
      parentId: parentId
    }).get()
    
    if (childResult.data.length === 0) {
      return { code: -1, msg: '权限不足或儿童不存在' }
    }
    
    // 更新儿童信息
    const updateData = {
      name: data.name,
      age: data.age,
      avatar: data.avatar,
      updateTime: new Date()
    }
    
    await db.collection('children').doc(data._id).update({
      data: updateData
    })
    
    return { code: 0, msg: '更新成功' }
  } catch (error) {
    console.error('updateChild error:', error)
    return { code: -1, msg: '更新儿童信息失败' }
  }
}

async function deleteChild(parentId, data) {
  try {
    // 验证权限
    const childResult = await db.collection('children').where({
      _id: data._id,
      parentId: parentId
    }).get()
    
    if (childResult.data.length === 0) {
      return { code: -1, msg: '权限不足或儿童不存在' }
    }
    
    // 删除儿童信息
    await db.collection('children').doc(data._id).remove()
    
    return { code: 0, msg: '删除成功' }
  } catch (error) {
    console.error('deleteChild error:', error)
    return { code: -1, msg: '删除儿童信息失败' }
  }
}