const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 索引管理云函数
 * 支持创建、删除、查询数据库索引
 */
exports.main = async (event, context) => {
  const { action, collection, indexName, keys, options } = event
  
  try {
    switch (action) {
      case 'createIndex':
        return await createIndex(collection, indexName, keys, options)
      case 'createAllIndexes':
        return await createAllIndexes()
      case 'listIndexes':
        return await listIndexes(collection)
      case 'dropIndex':
        return await dropIndex(collection, indexName)
      default:
        return {
          code: -1,
          message: '未知操作类型'
        }
    }
  } catch (error) {
    console.error('索引管理错误:', error)
    return {
      code: -1,
      message: error.message,
      error: error
    }
  }
}

/**
 * 创建单个索引
 */
async function createIndex(collection, indexName, keys, options = {}) {
  try {
    const result = await db.collection(collection).createIndex({
      name: indexName,
      keys: keys,
      ...options
    })
    
    return {
      code: 0,
      message: `索引 ${indexName} 创建成功`,
      data: result
    }
  } catch (error) {
    // 如果索引已存在，返回成功
    if (error.message && error.message.includes('already exists')) {
      return {
        code: 0,
        message: `索引 ${indexName} 已存在`,
        data: { existed: true }
      }
    }
    throw error
  }
}

/**
 * 创建所有推荐索引
 */
async function createAllIndexes() {
  const indexes = [
    // users集合
    {
      collection: 'users',
      name: 'openid_1',
      keys: { openid: 1 },
      options: { unique: true }
    },
    
    // children集合
    {
      collection: 'children',
      name: 'parentId_1',
      keys: { parentId: 1 }
    },
    
    // tasks集合
    {
      collection: 'tasks',
      name: 'parentId_status_1',
      keys: { parentId: 1, status: 1 }
    },
    {
      collection: 'tasks',
      name: 'childIds_status_1',
      keys: { childIds: 1, status: 1 }
    },
    
    // task_completion_records集合
    {
      collection: 'task_completion_records',
      name: 'taskId_childId_1',
      keys: { taskId: 1, childId: 1 }
    },
    {
      collection: 'task_completion_records',
      name: 'childId_completeDate_-1',
      keys: { childId: 1, completeDate: -1 }
    },
    
    // point_records集合
    {
      collection: 'point_records',
      name: 'childId_recordTime_-1',
      keys: { childId: 1, recordTime: -1 }
    },
    {
      collection: 'point_records',
      name: 'childId_changeType_recordTime_-1',
      keys: { childId: 1, changeType: 1, recordTime: -1 }
    },
    
    // rewards集合
    {
      collection: 'rewards',
      name: 'parentId_status_1',
      keys: { parentId: 1, status: 1 }
    },
    {
      collection: 'rewards',
      name: 'pointsRequired_status_1',
      keys: { pointsRequired: 1, status: 1 }
    },
    
    // exchange_records集合
    {
      collection: 'exchange_records',
      name: 'childId_exchangeTime_-1',
      keys: { childId: 1, exchangeTime: -1 }
    },
    {
      collection: 'exchange_records',
      name: 'parentId_status_exchangeTime_-1',
      keys: { parentId: 1, status: 1, exchangeTime: -1 }
    },
    
    // task_templates集合
    {
      collection: 'task_templates',
      name: 'isActive_ageGroup_category_1',
      keys: { isActive: 1, ageGroup: 1, category: 1 }
    },
    {
      collection: 'task_templates',
      name: 'createBy_isActive_1',
      keys: { createBy: 1, isActive: 1 }
    },
    
    // reward_templates集合
    {
      collection: 'reward_templates',
      name: 'isActive_ageGroup_category_1',
      keys: { isActive: 1, ageGroup: 1, category: 1 }
    },
    {
      collection: 'reward_templates',
      name: 'isActive_pointsRequired_1',
      keys: { isActive: 1, pointsRequired: 1 }
    },
    
    // dictionaries集合
    {
      collection: 'dictionaries',
      name: 'category_is_active_1',
      keys: { category: 1, is_active: 1 }
    }
  ]
  
  const results = []
  let successCount = 0
  let failCount = 0
  
  for (const index of indexes) {
    try {
      const result = await createIndex(
        index.collection,
        index.name,
        index.keys,
        index.options
      )
      results.push({
        collection: index.collection,
        name: index.name,
        result: result
      })
      if (result.code === 0) {
        successCount++
      } else {
        failCount++
      }
    } catch (error) {
      results.push({
        collection: index.collection,
        name: index.name,
        error: error.message
      })
      failCount++
    }
  }
  
  return {
    code: 0,
    message: `索引创建完成，成功: ${successCount}, 失败: ${failCount}`,
    data: {
      total: indexes.length,
      success: successCount,
      failed: failCount,
      details: results
    }
  }
}

/**
 * 查询集合的索引列表
 */
async function listIndexes(collection) {
  try {
    const result = await db.collection(collection).listIndexes()
    return {
      code: 0,
      message: '查询成功',
      data: result
    }
  } catch (error) {
    throw error
  }
}

/**
 * 删除索引
 */
async function dropIndex(collection, indexName) {
  try {
    const result = await db.collection(collection).dropIndex(indexName)
    return {
      code: 0,
      message: `索引 ${indexName} 删除成功`,
      data: result
    }
  } catch (error) {
    throw error
  }
}