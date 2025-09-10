// 奖励管理云函数
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
        return await getRewards(wxContext.OPENID, data)
      case 'create':
        return await createReward(wxContext.OPENID, data)
      case 'update':
        return await updateReward(wxContext.OPENID, data)
      case 'delete':
        return await deleteReward(wxContext.OPENID, data)
      case 'exchange':
        return await exchangeReward(wxContext.OPENID, data)
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (error) {
    console.error('manageRewards error:', error)
    return { code: -1, message: '系统错误，请稍后重试' }
  }
}

async function getRewards(parentId, filters) {
  try {
    let query = db.collection('rewards').where({
      parentId: parentId
    })
    
    // 应用过滤条件
    if (filters && filters.status) {
      query = query.where({
        status: filters.status
      })
    }
    
    const result = await query.get()
    
    return { code: 0, message: 'success', data: result.data }
  } catch (error) {
    console.error('getRewards error:', error)
    return { code: -1, message: '获取奖励列表失败' }
  }
}

async function createReward(parentId, data) {
  try {
    const rewardData = {
      name: data.name,
      description: data.description || '',
      pointsRequired: data.pointsRequired || 0,
      rewardType: data.rewardType || 'physical',
      stock: data.stock || 0,
      status: data.status || 'active',
      parentId: parentId,
      createTime: new Date(),
      updateTime: new Date()
    }
    
    const result = await db.collection('rewards').add({
      data: rewardData
    })
    
    rewardData._id = result._id
    return { code: 0, message: '创建成功', data: rewardData }
  } catch (error) {
    console.error('createReward error:', error)
    return { code: -1, message: '创建奖励失败' }
  }
}

async function updateReward(parentId, data) {
  try {
    // 验证权限
    const rewardResult = await db.collection('rewards').where({
      _id: data._id,
      parentId: parentId
    }).get()
    
    if (rewardResult.data.length === 0) {
      return { code: -1, message: '权限不足或奖励不存在' }
    }
    
    // 更新奖励信息
    const updateData = {
      name: data.name,
      description: data.description,
      pointsRequired: data.pointsRequired,
      rewardType: data.rewardType,
      stock: data.stock,
      status: data.status,
      updateTime: new Date()
    }
    
    await db.collection('rewards').doc(data._id).update({
      data: updateData
    })
    
    return { code: 0, message: '更新成功' }
  } catch (error) {
    console.error('updateReward error:', error)
    return { code: -1, message: '更新奖励失败' }
  }
}

async function deleteReward(parentId, data) {
  try {
    // 验证权限
    const rewardResult = await db.collection('rewards').where({
      _id: data._id,
      parentId: parentId
    }).get()
    
    if (rewardResult.data.length === 0) {
      return { code: -1, message: '权限不足或奖励不存在' }
    }
    
    // 删除奖励
    await db.collection('rewards').doc(data._id).remove()
    
    return { code: 0, message: '删除成功' }
  } catch (error) {
    console.error('deleteReward error:', error)
    return { code: -1, message: '删除奖励失败' }
  }
}

async function exchangeReward(parentId, data) {
  try {
    const { rewardId, childId } = data
    
    // 验证奖励是否存在且启用
    const rewardResult = await db.collection('rewards').where({
      _id: rewardId,
      status: 'active'
    }).get()
    
    if (rewardResult.data.length === 0) {
      return { code: -1, message: '奖励不存在或未启用' }
    }
    
    const reward = rewardResult.data[0]
    
    // 验证儿童是否存在且属于当前家长
    const childResult = await db.collection('children').where({
      _id: childId,
      parentId: parentId
    }).get()
    
    if (childResult.data.length === 0) {
      return { code: -1, message: '儿童不存在或权限不足' }
    }
    
    const child = childResult.data[0]
    
    // 检查儿童积分是否足够
    if (child.totalPoints < reward.pointsRequired) {
      return { code: -1, message: '积分不足' }
    }
    
    // 检查奖励库存
    if (reward.stock <= 0) {
      return { code: -1, message: '奖励库存不足' }
    }
    
    // 创建兑换记录
    const exchangeRecord = {
      rewardId: rewardId,
      childId: childId,
      pointsUsed: reward.pointsRequired,
      exchangeTime: new Date(),
      status: 'pending',
      parentId: parentId,
      _openid: wxContext.OPENID,
      createTime: new Date()
    }
    
    await db.collection('exchange_records').add({
      data: exchangeRecord
    })
    
    // 更新儿童积分
    await db.collection('children').doc(childId).update({
      data: {
        totalPoints: _.inc(-reward.pointsRequired),
        totalConsumedPoints: _.inc(reward.pointsRequired),
        updateTime: new Date()
      }
    })
    
    // 更新奖励库存
    await db.collection('rewards').doc(rewardId).update({
      data: {
        stock: _.inc(-1),
        updateTime: new Date()
      }
    })
    
    // 创建积分记录
    const pointRecord = {
      childId: childId,
      points: -reward.pointsRequired,
      changeType: 'consume',
      reason: `兑换奖励: ${reward.name}`,
      sourceType: 'exchange',
      recordTime: new Date(),
      createTime: new Date(),
      createBy: parentId
    }
    
    await db.collection('point_records').add({
      data: pointRecord
    })
    
    return { code: 0, message: '兑换成功', data: { exchangeRecord } }
  } catch (error) {
    console.error('exchangeReward error:', error)
    return { code: -1, message: '兑换奖励失败' }
  }
}