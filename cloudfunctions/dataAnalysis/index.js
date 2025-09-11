// 数据分析云函数
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, data } = event
  
  try {
    switch (action) {
      case 'taskStats':
        return await getTaskStatistics(wxContext.OPENID, data)
      case 'pointStats':
        return await getPointStatistics(wxContext.OPENID, data)
      case 'rewardStats':
        return await getRewardStatistics(wxContext.OPENID, data)
      case 'childStats':
        return await getChildStatistics(wxContext.OPENID, data)
      default:
        return { code: -1, msg: '未知操作' }
    }
  } catch (error) {
    console.error('dataAnalysis error:', error)
    return { code: -1, msg: '系统错误，请稍后重试' }
  }
}

async function getTaskStatistics(parentId, filters) {
  try {
    // 获取任务完成统计
    const completionStats = await db.collection('task_completion_records')
      .aggregate()
      .match({
        createBy: parentId
      })
      .group({
        _id: {
          date: $.dateToString({
            format: '%Y-%m-%d',
            date: '$completeDate'
          })
        },
        count: $.sum(1),
        points: $.sum('$pointsEarned')
      })
      .sort({
        '_id.date': 1
      })
      .end()
    
    // 获取任务类型统计
    const taskTypeStats = await db.collection('tasks')
      .aggregate()
      .match({
        parentId: parentId
      })
      .group({
        _id: '$taskType',
        count: $.sum(1)
      })
      .end()
    
    return { 
      code: 0, 
      msg: 'success', 
      data: { 
        completionStats: completionStats.data,
        taskTypeStats: taskTypeStats.data
      } 
    }
  } catch (error) {
    console.error('getTaskStatistics error:', error)
    return { code: -1, msg: '获取任务统计失败' }
  }
}

async function getPointStatistics(parentId, filters) {
  try {
    // 获取积分变动统计
    const pointStats = await db.collection('point_records')
      .aggregate()
      .match({
        createBy: parentId
      })
      .group({
        _id: {
          date: $.dateToString({
            format: '%Y-%m-%d',
            date: '$recordTime'
          }),
          changeType: '$changeType'
        },
        count: $.sum(1),
        points: $.sum('$points')
      })
      .sort({
        '_id.date': 1
      })
      .end()
    
    // 按类型汇总
    const typeSummary = await db.collection('point_records')
      .aggregate()
      .match({
        createBy: parentId
      })
      .group({
        _id: '$changeType',
        totalPoints: $.sum('$points'),
        count: $.sum(1)
      })
      .end()
    
    return { 
      code: 0, 
      msg: 'success', 
      data: { 
        pointStats: pointStats.data,
        typeSummary: typeSummary.data
      } 
    }
  } catch (error) {
    console.error('getPointStatistics error:', error)
    return { code: -1, msg: '获取积分统计失败' }
  }
}

async function getRewardStatistics(parentId, filters) {
  try {
    // 获取兑换统计
    const exchangeStats = await db.collection('exchange_records')
      .aggregate()
      .match({
        parentId: parentId
      })
      .group({
        _id: {
          date: $.dateToString({
            format: '%Y-%m-%d',
            date: '$exchangeTime'
          }),
          status: '$status'
        },
        count: $.sum(1),
        points: $.sum('$pointsUsed')
      })
      .sort({
        '_id.date': 1
      })
      .end()
    
    // 获取奖励类型统计
    const rewardTypeStats = await db.collection('rewards')
      .aggregate()
      .match({
        parentId: parentId
      })
      .group({
        _id: '$rewardType',
        count: $.sum(1)
      })
      .end()
    
    return { 
      code: 0, 
      msg: 'success', 
      data: { 
        exchangeStats: exchangeStats.data,
        rewardTypeStats: rewardTypeStats.data
      } 
    }
  } catch (error) {
    console.error('getRewardStatistics error:', error)
    return { code: -1, msg: '获取奖励统计失败' }
  }
}

async function getChildStatistics(parentId, data) {
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
    
    // 获取儿童任务完成统计
    const taskCompletionStats = await db.collection('task_completion_records')
      .aggregate()
      .match({
        childId: childId
      })
      .group({
        _id: {
          date: $.dateToString({
            format: '%Y-%m-%d',
            date: '$completeDate'
          })
        },
        count: $.sum(1),
        points: $.sum('$pointsEarned')
      })
      .sort({
        '_id.date': 1
      })
      .end()
    
    // 获取儿童积分变动统计
    const pointStats = await db.collection('point_records')
      .aggregate()
      .match({
        childId: childId
      })
      .group({
        _id: '$changeType',
        totalPoints: $.sum('$points'),
        count: $.sum(1)
      })
      .end()
    
    return { 
      code: 0, 
      msg: 'success', 
      data: { 
        child: childResult.data[0],
        taskCompletionStats: taskCompletionStats.data,
        pointStats: pointStats.data
      } 
    }
  } catch (error) {
    console.error('getChildStatistics error:', error)
    return { code: -1, msg: '获取儿童统计失败' }
  }
}