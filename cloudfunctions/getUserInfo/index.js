// 用户信息管理云函数
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
      case 'get':
        return await getUserInfo(wxContext.OPENID)
      case 'update':
        return await updateUserInfo(wxContext.OPENID, data)
      default:
        return { code: -1, msg: '未知操作' }
    }
  } catch (error) {
    console.error('getUserInfo error:', error)
    return { code: -1, msg: '系统错误，请稍后重试' }
  }
}

async function getUserInfo(openid) {
  try {
    const result = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (result.data.length > 0) {
      return { code: 0, msg: 'success', data: result.data[0] }
    } else {
      // 如果用户不存在，创建新用户
      const newUser = {
        openid: openid,
        nickName: '',
        avatarUrl: '',
        isAdmin: false,
        isAdvancedUser: false,
        createTime: new Date(),
        updateTime: new Date()
      }
      
      const addResult = await db.collection('users').add({
        data: newUser
      })
      
      newUser._id = addResult._id
      return { code: 0, msg: 'success', data: newUser }
    }
  } catch (error) {
    console.error('getUserInfo error:', error)
    return { code: -1, msg: '获取用户信息失败' }
  }
}

async function updateUserInfo(openid, data) {
  try {
    // 验证用户身份
    const userResult = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      return { code: -1, msg: '用户不存在' }
    }
    
    // 更新用户信息
    const updateData = {
      nickName: data.nickName || '',
      avatarUrl: data.avatarUrl || '',
      updateTime: new Date()
    }
    
    await db.collection('users').where({
      openid: openid
    }).update({
      data: updateData
    })
    
    return { code: 0, msg: '更新成功' }
  } catch (error) {
    console.error('updateUserInfo error:', error)
    return { code: -1, msg: '更新用户信息失败' }
  }
}