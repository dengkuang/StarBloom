// 儿童信息管理云函数
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 计算年龄的辅助函数
function calculateAge(birthday) {
  if (!birthday) return 0;
  
  const birthDate = new Date(birthday);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // 如果还没到生日，年龄减1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  // 确保年龄在合理范围内
  if (age < 0) age = 0;
  if (age > 18) age = 18;
  
  return age;
}

// 为孩子数据添加计算的年龄
function addCalculatedAge(child) {
  if (child.birthday) {
    child.age = calculateAge(child.birthday);
  }
  return child;
}

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
      case 'getStats':
        return await getChildStats(wxContext.OPENID, data)
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
    
    // 为每个孩子计算年龄
    const childrenWithAge = result.data.map(child => addCalculatedAge(child));
    
    return { code: 0, msg: 'success', data: childrenWithAge }
  } catch (error) {
    console.error('getChildrenList error:', error)
    return { code: -1, msg: '获取儿童列表失败' }
  }
}

async function createChild(parentId, data) {
  console.log('createChild data:', data)
  try {
    // 根据生日自动计算年龄
    const calculatedAge = data.birthday ? calculateAge(data.birthday) : (data.age || 0);
    
    const childData = {
      name: data.name,
      gender: data.gender || 'male',
      birthday: data.birthday || '',
      age: calculatedAge, // 使用计算的年龄
      avatar: data.avatar || '',
      interests: data.interests || '',
      grade: data.grade || '',
      school: data.school || '',
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
    
    // 返回时也确保年龄是最新计算的
    const childWithAge = addCalculatedAge(childData);
    
    return { code: 0, msg: '创建成功', data: childWithAge }
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
    
    // 根据生日自动计算年龄
    const calculatedAge = data.birthday ? calculateAge(data.birthday) : (data.age || 0);
    
    // 更新儿童信息
    const updateData = {
      name: data.name,
      gender: data.gender,
      birthday: data.birthday,
      age: calculatedAge, // 使用计算的年龄
      avatar: data.avatar,
      interests: data.interests,
      grade: data.grade,
      school: data.school,
      updateTime: new Date()
    }
    
    await db.collection('children').doc(data._id).update({
      data: updateData
    })
    
    // 获取更新后的数据并计算年龄返回
    const updatedResult = await db.collection('children').doc(data._id).get();
    const updatedChild = addCalculatedAge(updatedResult.data);
    
    return { code: 0, msg: '更新成功', data: updatedChild }
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

async function getChildStats(parentId, data) {
  try {
    const childId = data
    
    // 验证儿童是否存在且属于当前家长
    const childResult = await db.collection('children').where({
      _id: childId,
      parentId: parentId
    }).get()
    
    if (childResult.data.length === 0) {
      return { code: -1, msg: '儿童不存在或权限不足' }
    }
    
    const child = childResult.data[0]
    
    // 获取任务完成统计
    const taskCompletionResult = await db.collection('task_completion_records').where({
      childId: childId
    }).count()
    
    const tasksCompleted = taskCompletionResult.total
    
    // 获取奖励兑换统计
    const exchangeResult = await db.collection('exchange_records').where({
      childId: childId
    }).count()
    
    const rewardsExchanged = exchangeResult.total
    
    // 获取积分记录统计
    const pointRecordsResult = await db.collection('point_records').where({
      childId: childId
    }).count()
    
    const pointRecords = pointRecordsResult.total
    
    // 计算最新年龄
    const childWithAge = addCalculatedAge(child);
    
    return { 
      code: 0, 
      msg: 'success', 
      data: {
        childInfo: {
          name: childWithAge.name,
          gender: childWithAge.gender,
          birthday: childWithAge.birthday,
          age: childWithAge.age, // 使用计算的年龄
          avatar: childWithAge.avatar,
          interests: childWithAge.interests,
          grade: childWithAge.grade
        },
        stats: {
          totalPoints: childWithAge.totalPoints || 0,
          totalEarnedPoints: childWithAge.totalEarnedPoints || 0,
          totalConsumedPoints: childWithAge.totalConsumedPoints || 0,
          tasksCompleted: tasksCompleted,
          rewardsExchanged: rewardsExchanged,
          pointRecords: pointRecords
        }
      }
    }
  } catch (error) {
    console.error('getChildStats error:', error)
    return { code: -1, msg: '获取儿童统计信息失败' }
  }
}