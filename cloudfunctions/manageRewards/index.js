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
      case 'getMyRewards':
        return await getMyRewards(wxContext.OPENID, data)
      case 'create':
        return await createReward(wxContext.OPENID, data)
      case 'update':
        return await updateReward(wxContext.OPENID, data)
      case 'delete':
        return await deleteReward(wxContext.OPENID, data)
      case 'exchange':
        return await exchangeReward(wxContext.OPENID, data)
      default:
        return { code: -1, msg: '未知操作' }
    }
  } catch (error) {
    console.error('manageRewards error:', error)
    return { code: -1, msg: '系统错误，请稍后重试' }
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
    
    return { code: 0, msg: 'success', data: result.data }
  } catch (error) {
    console.error('getRewards error:', error)
    return { code: -1, msg: '获取奖励列表失败' }
  }
}

async function getMyRewards(parentId, data) {
  try {
    console.log('=== 开始获取我的奖励列表 ===')
    console.log('收到参数:', { parentId, data })
    
    const childId = data
    if (!childId) {
      return { code: -1, msg: '参数错误：缺少儿童ID' }
    }
    
    // 获取分配给该儿童的所有活跃奖励
    const rewardsResult = await db.collection('rewards').where({
      childIds: _.in([childId]),
      status: 'active'
    }).get()
    
    if (rewardsResult.data.length === 0) {
      return { code: 0, msg: 'success', data: [] }
    }
    
    const rewards = rewardsResult.data
    
    // 获取儿童当前积分
    const childResult = await db.collection('children').doc(childId).get()
    if (!childResult.data) {
      return { code: -1, msg: '儿童信息不存在' }
    }
    
    const currentPoints = childResult.data.totalPoints || 0
    console.log(`当前积分：${currentPoints}`)
    
    // 为每个奖励添加可兑换状态
    const rewardsWithStatus = rewards.map(reward => ({
      ...reward,
      canExchange: currentPoints >= (reward.pointsRequired || 0) && (reward.recommendedStock || 0) > 0,
      currentPoints,
      pointsNeeded: Math.max(0, (reward.pointsRequired || 0) - currentPoints)
    }))
    
    // 按积分要求排序，可兑换的在前
    rewardsWithStatus.sort((a, b) => {
      if (a.canExchange && !b.canExchange) return -1
      if (!a.canExchange && b.canExchange) return 1
      return (a.pointsRequired || 0) - (b.pointsRequired || 0)
    })
    
    console.log(`处理完成，共${rewardsWithStatus.length}个奖励`)
    
    return { 
      code: 0, 
      msg: 'success', 
      data: rewardsWithStatus,
      meta: {
        total: rewardsWithStatus.length,
        canExchange: rewardsWithStatus.filter(r => r.canExchange).length,
        currentPoints
      }
    }
  } catch (error) {
    console.error('getMyRewards error:', error)
    return { code: -1, msg: '获取我的奖励列表失败' }
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
      childIds: data.childIds || [], // 新增childIds字段
      createTime: new Date(),
      updateTime: new Date()
    }
    
    const result = await db.collection('rewards').add({
      data: rewardData
    })
    
    rewardData._id = result._id
    return { code: 0, msg: '创建成功', data: rewardData }
  } catch (error) {
    console.error('createReward error:', error)
    return { code: -1, msg: '创建奖励失败' }
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
      return { code: -1, msg: '权限不足或奖励不存在' }
    }
    
    // 更新奖励信息
    const updateData = {
      name: data.name,
      description: data.description,
      pointsRequired: data.pointsRequired,
      rewardType: data.rewardType,
      stock: data.stock,
      status: data.status,
      childIds: data.childIds || [], // 新增childIds字段支持
      updateTime: new Date()
    }
    
    await db.collection('rewards').doc(data._id).update({
      data: updateData
    })
    
    return { code: 0, msg: '更新成功' }
  } catch (error) {
    console.error('updateReward error:', error)
    return { code: -1, msg: '更新奖励失败' }
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
      return { code: -1, msg: '权限不足或奖励不存在' }
    }
    
    // 删除奖励
    await db.collection('rewards').doc(data._id).remove()
    
    return { code: 0, msg: '删除成功' }
  } catch (error) {
    console.error('deleteReward error:', error)
    return { code: -1, msg: '删除奖励失败' }
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
      return { code: -1, msg: '奖励不存在或未启用' }
    }
    
    const reward = rewardResult.data[0]
    
    // 验证儿童是否存在且属于当前家长
    const childResult = await db.collection('children').where({
      _id: childId,
      parentId: parentId
    }).get()
    
    if (childResult.data.length === 0) {
      return { code: -1, msg: '儿童不存在或权限不足' }
    }
    
    const child = childResult.data[0]
    
    // 检查儿童积分是否足够
    if (child.totalPoints < reward.pointsRequired) {
      return { code: -1, msg: '积分不足' }
    }
    
    // 检查奖励库存
    if (reward.stock <= 0) {
      return { code: -1, msg: '奖励库存不足' }
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
    
    return { code: 0, msg: '兑换成功', data: { exchangeRecord } }
  } catch (error) {
    console.error('exchangeReward error:', error)
    return { code: -1, msg: '兑换奖励失败' }
  }
}