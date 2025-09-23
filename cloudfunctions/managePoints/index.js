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
      case 'getStatistics':
        return await getPointStatistics(wxContext.OPENID, data)
      case 'getHistory':
        return await getPointRecords(wxContext.OPENID, data)
      case 'getBalance':
        return await getPointBalance(wxContext.OPENID, data)
      case 'createExchange':
        return await createExchange(wxContext.OPENID, data)
      case 'getExchangeHistory':
        return await getExchangeHistory(wxContext.OPENID, data)
      case 'approveExchange':
        return await approveExchange(wxContext.OPENID, data)
      case 'rejectExchange':
        return await rejectExchange(wxContext.OPENID, data)
      default:
        return { code: -1, msg: '未知操作' }
    }
  } catch (error) {
    console.error('managePoints error:', error)
    return { code: -1, msg: '系统错误，请稍后重试' }
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
        return { code: -1, msg: '儿童不存在或权限不足' }
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
      if (Array.isArray(filters.changeType)) {
        query = query.where({
          changeType: _.in(filters.changeType)
        })
      } else {
        query = query.where({
          changeType: filters.changeType
        })
      }
    }
    
    // 按时间倒序排列
    query = query.orderBy('recordTime', 'desc')
    
    // 分页参数
    const page = filters.page || 1
    const pageSize = filters.pageSize || 20
    const skip = (page - 1) * pageSize
    
    // 获取总数
    const countResult = await query.count()
    const total = countResult.total
    
    // 获取分页数据
    query = query.skip(skip).limit(pageSize)
    const result = await query.get()
    
    console.log('getPointRecords result:', { filters, total, count: result.data.length })
    
    return { 
      code: 0, 
      msg: 'success', 
      data: {
        records: result.data,
        total: total,
        page: page,
        pageSize: pageSize,
        hasMore: skip + result.data.length < total
      }
    }
  } catch (error) {
    console.error('getPointRecords error:', error)
    return { code: -1, msg: '获取积分记录失败' }
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
      return { code: -1, msg: '儿童不存在或权限不足' }
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
    
    return { code: 0, msg: '积分增加成功' }
  } catch (error) {
    console.error('addPoints error:', error)
    return { code: -1, msg: '增加积分失败' }
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
      return { code: -1, msg: '儿童不存在或权限不足' }
    }
    
    const child = childResult.data[0]
    
    // 检查积分是否足够
    if (child.totalPoints < points) {
      return { code: -1, msg: '积分不足' }
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
    
    return { code: 0, msg: '积分扣减成功' }
  } catch (error) {
    console.error('subtractPoints error:', error)
    return { code: -1, msg: '扣减积分失败' }
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
      return { code: -1, msg: '儿童不存在或权限不足' }
    }
    
    const child = childResult.data[0]
    
    return { code: 0, msg: 'success', data: { 
      totalPoints: child.totalPoints,
      totalEarnedPoints: child.totalEarnedPoints,
      totalConsumedPoints: child.totalConsumedPoints
    }}
  } catch (error) {
    console.error('getPointBalance error:', error)
    return { code: -1, msg: '获取积分余额失败' }
  }
}

async function getPointStatistics(parentId, data) {
  try {
    const { childId } = data
    console.log('🔍 [云函数DEBUG] getPointStatistics 开始执行');
    console.log('🔍 [云函数DEBUG] parentId:', parentId);
    console.log('🔍 [云函数DEBUG] childId:', childId);
    
    // 验证儿童是否存在且属于当前家长
    const childResult = await db.collection('children').where({
      _id: childId,
      parentId: parentId
    }).get()
    
    console.log('🔍 [云函数DEBUG] 查询儿童结果:', childResult.data.length);
    
    if (childResult.data.length === 0) {
      console.log('❌ [云函数DEBUG] 儿童不存在或权限不足');
      return { code: -1, msg: '儿童不存在或权限不足' }
    }
    
    const child = childResult.data[0]
    console.log('🔍 [云函数DEBUG] 儿童数据:', {
      _id: child._id,
      name: child.name,
      totalPoints: child.totalPoints,
      totalEarnedPoints: child.totalEarnedPoints,
      totalConsumedPoints: child.totalConsumedPoints
    });
    
    // 获取积分记录统计
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const monthAgo = new Date(today)
    monthAgo.setDate(monthAgo.getDate() - 30)
    
    // 获取今日积分
    const todayPointsResult = await db.collection('point_records').where({
      childId: childId,
      recordTime: _.gte(today),
      changeType: _.in(['earn', 'adjustment_add'])
    }).get()
    
    const todayPoints = todayPointsResult.data.reduce((sum, record) => sum + (record.points || 0), 0)
    
    // 获取本周积分
    const weekPointsResult = await db.collection('point_records').where({
      childId: childId,
      recordTime: _.gte(weekAgo),
      changeType: _.in(['earn', 'adjustment_add'])
    }).get()
    
    const weekPoints = weekPointsResult.data.reduce((sum, record) => sum + (record.points || 0), 0)
    
    // 获取本月积分
    const monthPointsResult = await db.collection('point_records').where({
      childId: childId,
      recordTime: _.gte(monthAgo),
      changeType: _.in(['earn', 'adjustment_add'])
    }).get()
    
    const monthPoints = monthPointsResult.data.reduce((sum, record) => sum + (record.points || 0), 0)
    
    // 获取任务完成统计
    const taskCompletionResult = await db.collection('task_completion_records').where({
      childId: childId
    }).count()
    
    const tasksCompleted = taskCompletionResult.total
    
    const resultData = {
      totalPoints: child.totalPoints || 0,
      totalEarnedPoints: child.totalEarnedPoints || 0,
      totalConsumedPoints: child.totalConsumedPoints || 0,
      todayPoints: todayPoints,
      weekPoints: weekPoints,
      monthPoints: monthPoints,
      tasksCompleted: tasksCompleted
    };
    
    console.log('✅ [云函数DEBUG] 积分统计计算完成');
    console.log('🔍 [云函数DEBUG] 返回数据:', JSON.stringify(resultData, null, 2));
    
    return { 
      code: 0, 
      msg: 'success', 
      data: resultData
    }
  } catch (error) {
    console.error('getPointStatistics error:', error)
    return { code: -1, msg: '获取积分统计失败' }
  }
}

async function createExchange(parentId, data) {
  try {
    const { childId, rewardId, quantity = 1 } = data
    
    // 验证儿童是否存在且属于当前家长
    const childResult = await db.collection('children').where({
      _id: childId,
      parentId: parentId
    }).get()
    
    if (childResult.data.length === 0) {
      return { code: -1, msg: '儿童不存在或权限不足' }
    }
    
    const child = childResult.data[0]
    
    // 获取奖励信息
    const rewardResult = await db.collection('rewards').doc(rewardId).get()
    if (!rewardResult.data) {
      return { code: -1, msg: '奖励不存在' }
    }
    
    const reward = rewardResult.data
    const totalCost = reward.pointsCost * quantity
    
    // 检查积分是否足够
    if (child.totalPoints < totalCost) {
      return { code: -1, msg: '积分不足' }
    }
    
    // 创建兑换申请
    const exchangeData = {
      childId: childId,
      rewardId: rewardId,
      rewardName: reward.name,
      quantity: quantity,
      pointsCost: totalCost,
      status: 'pending', // pending, approved, rejected
      createTime: new Date(),
      updateTime: new Date(),
      createBy: parentId
    }
    
    const result = await db.collection('exchange_records').add({
      data: exchangeData
    })
    
    exchangeData._id = result._id
    
    return { code: 0, msg: '兑换申请已提交', data: exchangeData }
  } catch (error) {
    console.error('createExchange error:', error)
    return { code: -1, msg: '创建兑换申请失败' }
  }
}

async function getExchangeHistory(parentId, data) {
  try {
    const { childId } = data
    
    // 验证儿童是否存在且属于当前家长
    const childResult = await db.collection('children').where({
      _id: childId,
      parentId: parentId
    }).get()
    
    if (childResult.data.length === 0) {
      return { code: -1, msg: '儿童不存在或权限不足' }
    }
    
    // 获取兑换记录
    const result = await db.collection('exchange_records').where({
      childId: childId
    }).orderBy('createTime', 'desc').get()
    
    return { code: 0, msg: 'success', data: result.data }
  } catch (error) {
    console.error('getExchangeHistory error:', error)
    return { code: -1, msg: '获取兑换记录失败' }
  }
}

async function approveExchange(parentId, data) {
  try {
    const { exchangeId } = data
    
    // 获取兑换记录
    const exchangeResult = await db.collection('exchange_records').doc(exchangeId).get()
    if (!exchangeResult.data) {
      return { code: -1, msg: '兑换记录不存在' }
    }
    
    const exchange = exchangeResult.data
    
    // 验证儿童权限
    const childResult = await db.collection('children').where({
      _id: exchange.childId,
      parentId: parentId
    }).get()
    
    if (childResult.data.length === 0) {
      return { code: -1, msg: '权限不足' }
    }
    
    const child = childResult.data[0]
    
    // 检查积分是否足够
    if (child.totalPoints < exchange.pointsCost) {
      return { code: -1, msg: '积分不足，无法完成兑换' }
    }
    
    // 更新兑换状态为已批准
    await db.collection('exchange_records').doc(exchangeId).update({
      data: {
        status: 'approved',
        updateTime: new Date(),
        approveBy: parentId
      }
    })
    
    // 扣除积分
    await db.collection('children').doc(exchange.childId).update({
      data: {
        totalPoints: _.inc(-exchange.pointsCost),
        totalConsumedPoints: _.inc(exchange.pointsCost),
        updateTime: new Date()
      }
    })
    
    // 创建积分扣除记录
    const pointRecord = {
      childId: exchange.childId,
      points: -exchange.pointsCost,
      changeType: 'exchange',
      reason: `兑换奖励: ${exchange.rewardName}`,
      sourceType: 'exchange',
      recordTime: new Date(),
      createTime: new Date(),
      createBy: parentId
    }
    
    await db.collection('point_records').add({
      data: pointRecord
    })
    
    return { code: 0, msg: '兑换已批准' }
  } catch (error) {
    console.error('approveExchange error:', error)
    return { code: -1, msg: '批准兑换失败' }
  }
}

async function rejectExchange(parentId, data) {
  try {
    const { exchangeId, reason } = data
    
    // 获取兑换记录
    const exchangeResult = await db.collection('exchange_records').doc(exchangeId).get()
    if (!exchangeResult.data) {
      return { code: -1, msg: '兑换记录不存在' }
    }
    
    const exchange = exchangeResult.data
    
    // 验证儿童权限
    const childResult = await db.collection('children').where({
      _id: exchange.childId,
      parentId: parentId
    }).get()
    
    if (childResult.data.length === 0) {
      return { code: -1, msg: '权限不足' }
    }
    
    // 更新兑换状态为已拒绝
    await db.collection('exchange_records').doc(exchangeId).update({
      data: {
        status: 'rejected',
        rejectReason: reason || '兑换申请被拒绝',
        updateTime: new Date(),
        rejectBy: parentId
      }
    })
    
    return { code: 0, msg: '兑换已拒绝' }
  } catch (error) {
    console.error('rejectExchange error:', error)
    return { code: -1, msg: '拒绝兑换失败' }
  }
}