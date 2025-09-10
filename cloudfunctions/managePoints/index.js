// 积分系统管理云函数
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, data } = event
  
  try {
    switch (action) {
      case 'list':
        return await getPointRecords(wxContext.OPENID, data)
      case 'add':
        return await addPoints(wxContext.OPENID, data)
      case 'subtract':
        return await subtractPoints(wxContext.OPENID, data)
      case 'balance':
        return await getPointBalance(wxContext.OPENID, data)
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (error) {
    console.error('managePoints error:', error)
    return { code: -1, message: '系统错误，请稍后重试' }
  }
}

async function getPointRecords(parentId, filters) {
  try {
    // 验证儿童是否存在且属于当前家长
    if (filters && filters.childId) {
      const childResult = await db.collection('children').where({
        _id: filters.childId,
        parentId: parentId
      }).get()
      
      if (childResult.data.length === 0) {
        return { code: -1, message: '儿童不存在或权限不足' }
      }
    }
    
    let query = db.collection('point_records')
    
    // 应用过滤条件
    if (filters && filters.childId) {
      query = query.where({
        childId: filters.childId
      })
    }
    
    if (filters && filters.changeType) {
      query = query.where({
        changeType: filters.changeType
      })
    }
    
    // 按时间倒序排列
    query = query.orderBy('recordTime', 'desc')
    
    const result = await query.get()
    
    return { code: 0, message: 'success', data: result.data }
  } catch (error) {
    console.error('getPointRecords error:', error)
    return { code: -1, message: '获取积分记录失败' }
  }
}

async function addPoints(parentId, data) {
  try {
    const { childId, points, reason } = data
    
    // 验证儿童是否存在且属于当前家长
    const childResult = await db.collection('children').where({
      _id: childId,
      parentId: parentId
    }).get()
    
    if (childResult.data.length === 0) {
      return { code: -1, message: '儿童不存在或权限不足' }
    }
    
    // 更新儿童积分
    await db.collection('children').doc(childId).update({
      data: {
        totalPoints: _.inc(points),
        totalEarnedPoints: _.inc(points),
        updateTime: new Date()
      }
    })
    
    // 创建积分记录
    const pointRecord = {
      childId: childId,
      points: points,
      changeType: 'adjustment_add',
      reason: reason || '手动调整积分',
      sourceType: 'adjustment',
      recordTime: new Date(),
      createTime: new Date(),
      createBy: parentId
    }
    
    await db.collection('point_records').add({
      data: pointRecord
    })
    
    return { code: 0, message: '积分增加成功' }
  } catch (error) {
    console.error('addPoints error:', error)
    return { code: -1, message: '增加积分失败' }
  }
}

async function subtractPoints(parentId, data) {
  try {
    const { childId, points, reason } = data
    
    // 验证儿童是否存在且属于当前家长
    const childResult = await db.collection('children').where({
      _id: childId,
      parentId: parentId
    }).get()
    
    if (childResult.data.length === 0) {
      return { code: -1, message: '儿童不存在或权限不足' }
    }
    
    const child = childResult.data[0]
    
    // 检查积分是否足够
    if (child.totalPoints < points) {
      return { code: -1, message: '积分不足' }
    }
    
    // 更新儿童积分
    await db.collection('children').doc(childId).update({
      data: {
        totalPoints: _.inc(-points),
        totalConsumedPoints: _.inc(points),
        updateTime: new Date()
      }
    })
    
    // 创建积分记录
    const pointRecord = {
      childId: childId,
      points: -points,
      changeType: 'adjustment_subtract',
      reason: reason || '手动调整积分',
      sourceType: 'adjustment',
      recordTime: new Date(),
      createTime: new Date(),
      createBy: parentId
    }
    
    await db.collection('point_records').add({
      data: pointRecord
    })
    
    return { code: 0, message: '积分扣减成功' }
  } catch (error) {
    console.error('subtractPoints error:', error)
    return { code: -1, message: '扣减积分失败' }
  }
}

async function getPointBalance(parentId, data) {
  try {
    const { childId } = data
    
    // 验证儿童是否存在且属于当前家长
    const childResult = await db.collection('children').where({
      _id: childId,
      parentId: parentId
    }).get()
    
    if (childResult.data.length === 0) {
      return { code: -1, message: '儿童不存在或权限不足' }
    }
    
    const child = childResult.data[0]
    
    return { code: 0, message: 'success', data: { 
      totalPoints: child.totalPoints,
      totalEarnedPoints: child.totalEarnedPoints,
      totalConsumedPoints: child.totalConsumedPoints
    }}
  } catch (error) {
    console.error('getPointBalance error:', error)
    return { code: -1, message: '获取积分余额失败' }
  }
}