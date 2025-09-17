// 任务管理云函数
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
        return await getTasks(wxContext.OPENID, data)
      case 'getMyTasks':
        return await getMyTasks(wxContext.OPENID, data)
      case 'create':
        return await createTask(wxContext.OPENID, data)
      case 'update':
        return await updateTask(wxContext.OPENID, data)
      case 'delete':
        return await deleteTask(wxContext.OPENID, data)
      case 'complete':
        return await completeTask(wxContext.OPENID, data)
      default:
        return { code: -1, msg: '未知操作' }
    }
  } catch (error) {
    console.error('manageTasks error:', error)
    return { code: -1, msg: '系统错误，请稍后重试' }
  }
}

async function getTasks(parentId, data) {
  try {
    // 构建查询条件
    const whereConditions = {
      parentId: parentId
    }
    console.log('=== 开始获取任务列表 ===')
    console.log('收到参数:', { parentId, data })
    // 应用过滤条件
    if (data && data.childId) {
       console.log('收到参数:', [data.childId])
      whereConditions.childIds = _.in([data.childId])
    }
    
    if (data && data.status) {
      whereConditions.status = data.status
    }
    
    const result = await db.collection('tasks').where(whereConditions).get()
    
    return { code: 0, msg: 'success', data: result.data }
  } catch (error) {
    console.error('getTasks error:', error)
    return { code: -1, msg: '获取任务列表失败' }
  }
}

async function getMyTasks(parentId, data) {
  try {
    console.log('=== 开始获取我的任务列表 ===')
    console.log('收到参数:', { parentId, data })
    
    const childId  = data
    if (!childId) {
      return { code: -1, msg: '参数错误：缺少儿童ID' }
    }
    
    // 获取分配给该儿童的所有活跃任务
    const tasksResult = await db.collection('tasks').where({
      childIds: _.in([childId]),
      status: 'active'
    }).get()
    
    if (tasksResult.data.length === 0) {
      return { code: 0, msg: 'success', data: [] }
    }
    
    const tasks = tasksResult.data
    const tasksWithStatus = []
    
    // 获取当前时间信息
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // 获取本周的开始时间（周一）
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // 如果是周日，往前推6天到周一
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() + mondayOffset)
    
    // 获取本周的结束时间（周日）
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    
    console.log('时间范围:', {
      today: today.toISOString(),
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString()
    })
    
    // 批量查询所有任务的完成记录
    const taskIds = tasks.map(task => task._id)
    
    for (const task of tasks) {
      let isCompleted = false
      let completionRecord = null
      
      if (task.taskType === 'daily') {
        // 检查今日是否有完成记录
        const dailyRecords = await db.collection('task_completion_records').where({
          taskId: task._id,
          childId: childId,
          completeDate: _.gte(today)
        }).get()
        
        if (dailyRecords.data.length > 0) {
          isCompleted = true
          completionRecord = dailyRecords.data[0]
        }
        
      } else if (task.taskType === 'weekly') {
        // 检查本周是否有完成记录
        const weeklyRecords = await db.collection('task_completion_records').where({
          taskId: task._id,
          childId: childId,
          completeDate: _.gte(weekStart).and(_.lte(weekEnd))
        }).get()
        
        if (weeklyRecords.data.length > 0) {
          isCompleted = true
          completionRecord = weeklyRecords.data[0]
        }
      }
      
      // 添加任务状态信息
      tasksWithStatus.push({
        ...task,
        isCompleted,
        completionRecord,
        completionStatus: isCompleted ? 'completed' : 'pending'
      })
    }
    
    console.log(`处理完成，共${tasksWithStatus.length}个任务`)
    
    return { 
      code: 0, 
      msg: 'success', 
      data: tasksWithStatus,
      meta: {
        total: tasksWithStatus.length,
        completed: tasksWithStatus.filter(t => t.isCompleted).length,
        pending: tasksWithStatus.filter(t => !t.isCompleted).length
      }
    }
  } catch (error) {
    console.error('getMyTasks error:', error)
    return { code: -1, msg: '获取我的任务列表失败' }
  }
}

async function createTask(parentId, data) {
  try {
    const taskData = {
      name: data.name,
      description: data.description || '',
      points: data.points || 0,
      taskType: data.taskType || 'daily',
      cycleType: data.cycleType || 'daily',
      status: data.status || 'active',
      parentId: parentId,
      childIds: data.childIds || [],
      createTime: new Date(),
      updateTime: new Date()
    }
    
    const result = await db.collection('tasks').add({
      data: taskData
    })
    
    taskData._id = result._id
    return { code: 0, msg: '创建成功', data: taskData }
  } catch (error) {
    console.error('createTask error:', error)
    return { code: -1, msg: '创建任务失败' }
  }
}

async function updateTask(parentId, data) {
  try {
    // 验证权限
    const taskResult = await db.collection('tasks').where({
      _id: data._id,
      parentId: parentId
    }).get()
    
    if (taskResult.data.length === 0) {
      return { code: -1, msg: '权限不足或任务不存在' }
    }
    
    // 更新任务信息
    const updateData = {
      name: data.name,
      description: data.description,
      points: data.points,
      taskType: data.taskType,
      cycleType: data.cycleType,
      status: data.status,
      childIds: data.childIds,
      updateTime: new Date()
    }
    
    await db.collection('tasks').doc(data._id).update({
      data: updateData
    })
    
    return { code: 0, msg: '更新成功' }
  } catch (error) {
    console.error('updateTask error:', error)
    return { code: -1, msg: '更新任务失败' }
  }
}

async function deleteTask(parentId, data) {
  try {
    // 验证权限
    const taskResult = await db.collection('tasks').where({
      _id: data._id,
      parentId: parentId
    }).get()
    
    if (taskResult.data.length === 0) {
      return { code: -1, msg: '权限不足或任务不存在' }
    }
    
    // 删除任务
    await db.collection('tasks').doc(data._id).remove()
    
    return { code: 0, msg: '删除成功' }
  } catch (error) {
    console.error('deleteTask error:', error)
    return { code: -1, msg: '删除任务失败' }
  }
}

async function completeTask(parentId, data) {
  try {
    console.log('=== 开始完成任务 ===')
    console.log('收到参数:', { parentId, data })
    
    if (!data) {
      console.error('data 参数为 undefined')
      return { code: -1, msg: '参数错误：缺少任务数据' }
    }
    
    const { taskId, childId } = data
    
    if (!taskId || !childId) {
      console.error('缺少必需参数:', { taskId, childId })
      return { code: -1, msg: '参数错误：缺少任务ID或儿童ID' }
    }
    
    console.log('解析参数成功:', { taskId, childId })
    
    // 验证任务权限
    const taskResult = await db.collection('tasks').where({
      _id: taskId,
      parentId: parentId
    }).get()
    
    if (taskResult.data.length === 0) {
      return { code: -1, msg: '权限不足或任务不存在' }
    }
    
    const task = taskResult.data[0]
    
    // 验证儿童权限
    if (!task.childIds.includes(childId)) {
      return { code: -1, msg: '该任务未分配给此儿童' }
    }
    
    // 检查是否已经完成
    const recordResult = await db.collection('task_completion_records').where({
      taskId: taskId,
      childId: childId,
      completeDate: _.gte(new Date(new Date().setHours(0, 0, 0, 0)))
    }).get()
    
    if (recordResult.data.length > 0) {
      return { code: -1, msg: '今日任务已完成' }
    }
    
    // 创建任务完成记录
    const completionRecord = {
      taskId: taskId,
      childId: childId,
      completeDate: new Date(),
      status: 'completed',
      pointsEarned: task.points,
      createBy: parentId,
      createTime: new Date(),
      updateTime: new Date()
    }
    
    await db.collection('task_completion_records').add({
      data: completionRecord
    })
    
    // 更新儿童积分
    await db.collection('children').doc(childId).update({
      data: {
        totalPoints: _.inc(task.points),
        totalEarnedPoints: _.inc(task.points),
        updateTime: new Date()
      }
    })
    
    // 创建积分记录
    const pointRecord = {
      childId: childId,
      points: task.points,
      changeType: 'earn',
      reason: `完成任务: ${task.name}`,
      sourceType: 'task',
      recordTime: new Date(),
      createTime: new Date(),
      createBy: parentId
    }
    
    await db.collection('point_records').add({
      data: pointRecord
    })
    
    return { code: 0, msg: '任务完成成功', data: { pointsEarned: task.points } }
  } catch (error) {
    console.error('completeTask error:', error)
    return { code: -1, msg: '完成任务失败' }
  }
}