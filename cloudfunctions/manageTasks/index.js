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
      case 'create':
        return await createTask(wxContext.OPENID, data)
      case 'update':
        return await updateTask(wxContext.OPENID, data)
      case 'delete':
        return await deleteTask(wxContext.OPENID, data)
      case 'complete':
        return await completeTask(wxContext.OPENID, data)
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (error) {
    console.error('manageTasks error:', error)
    return { code: -1, message: '系统错误，请稍后重试' }
  }
}

async function getTasks(parentId, filters) {
  try {
    let query = db.collection('tasks').where({
      parentId: parentId
    })
    
    // 应用过滤条件
    if (filters && filters.childId) {
      query = query.where({
        childIds: _.in([filters.childId])
      })
    }
    
    if (filters && filters.status) {
      query = query.where({
        status: filters.status
      })
    }
    
    const result = await query.get()
    
    return { code: 0, message: 'success', data: result.data }
  } catch (error) {
    console.error('getTasks error:', error)
    return { code: -1, message: '获取任务列表失败' }
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
    return { code: 0, message: '创建成功', data: taskData }
  } catch (error) {
    console.error('createTask error:', error)
    return { code: -1, message: '创建任务失败' }
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
      return { code: -1, message: '权限不足或任务不存在' }
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
    
    return { code: 0, message: '更新成功' }
  } catch (error) {
    console.error('updateTask error:', error)
    return { code: -1, message: '更新任务失败' }
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
      return { code: -1, message: '权限不足或任务不存在' }
    }
    
    // 删除任务
    await db.collection('tasks').doc(data._id).remove()
    
    return { code: 0, message: '删除成功' }
  } catch (error) {
    console.error('deleteTask error:', error)
    return { code: -1, message: '删除任务失败' }
  }
}

async function completeTask(parentId, data) {
  try {
    const { taskId, childId } = data
    
    // 验证任务权限
    const taskResult = await db.collection('tasks').where({
      _id: taskId,
      parentId: parentId
    }).get()
    
    if (taskResult.data.length === 0) {
      return { code: -1, message: '权限不足或任务不存在' }
    }
    
    const task = taskResult.data[0]
    
    // 验证儿童权限
    if (!task.childIds.includes(childId)) {
      return { code: -1, message: '该任务未分配给此儿童' }
    }
    
    // 检查是否已经完成
    const recordResult = await db.collection('task_completion_records').where({
      taskId: taskId,
      childId: childId,
      completeDate: _.gte(new Date(new Date().setHours(0, 0, 0, 0)))
    }).get()
    
    if (recordResult.data.length > 0) {
      return { code: -1, message: '今日任务已完成' }
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
    
    return { code: 0, message: '任务完成成功', data: { pointsEarned: task.points } }
  } catch (error) {
    console.error('completeTask error:', error)
    return { code: -1, message: '完成任务失败' }
  }
}