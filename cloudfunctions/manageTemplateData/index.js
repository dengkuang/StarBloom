// 模板数据管理云函数
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
      case 'list':
        return await getTemplateDataList(data)
      case 'create':
        return await createTemplateData(wxContext.OPENID, data)
      case 'update':
        return await updateTemplateData(wxContext.OPENID, data)
      case 'delete':
        return await deleteTemplateData(wxContext.OPENID, data)
      case 'get':
        return await getTemplateData(data)
      case 'applyTemplate':
        return await applyTemplateToChildren(wxContext.OPENID, data)
      case 'applyBatchTemplates':
        return await applyBatchTemplates(wxContext.OPENID, data)
      case 'getApplicationHistory':
        return await getApplicationHistory(data)
      case 'toggleStatus':
        return await toggleTemplateStatus(wxContext.OPENID, data)
      case 'getStats':
        return await getTemplateStats()
      case 'getPackageGroups':
        return await getPackageGroups(data)
      case 'applyPackageGroup':
        return await applyPackageGroup(wxContext.OPENID, data)
      case 'updateTemplatePackageGroup':
        return await updateTemplatePackageGroup(wxContext.OPENID, data)
      default:
        return { code: -1, msg: '未知操作' }
    }
  } catch (error) {
    console.error('manageTemplateData error:', error)
    return { code: -1, msg: '系统错误，请稍后重试' }
  }
}

async function getTemplateDataList(filters) {
  try {
    const { templateType } = filters || {}
    
    let query = db.collection(templateType === 'reward' ? 'reward_templates' : 'task_templates')
    
    // 应用过滤条件
    if (filters) {
      if (filters.createBy) {
        query = query.where({
          createBy: filters.createBy
        })
      }
      
      if (filters.isActive !== undefined) {
        query = query.where({
          isActive: filters.isActive
        })
      }
    }
    
    const result = await query.get()
    
    return { code: 0, msg: 'success', data: result.data }
  } catch (error) {
    console.error('getTemplateDataList error:', error)
    return { code: -1, msg: '获取模板数据列表失败' }
  }
}

async function createTemplateData(openid, data) {
  try {
    console.log('=== 开始创建模板数据 ===')
    console.log('openid:', openid)
    console.log('输入数据:', JSON.stringify(data, null, 2))
    
    const { templateType } = data
    
    // 验证必需字段
    if (!templateType) {
      console.error('缺少模板类型参数')
      return { code: -1, msg: '缺少模板类型参数' }
    }
    
    if (!data.name) {
      console.error('缺少模板名称')
      return { code: -1, msg: '缺少模板名称' }
    }
    
    // 验证 rewardType 是否为有效值
    if (templateType === 'reward' && data.rewardType) {
      const validRewardTypes = ['physical', 'privilege', 'experience', 'virtual', 'charity']
      if (!validRewardTypes.includes(data.rewardType)) {
        console.error('无效的奖励类型:', data.rewardType)
        return { code: -1, msg: `无效的奖励类型: ${data.rewardType}，有效值为: ${validRewardTypes.join(', ')}` }
      }
    }
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    console.log(`目标集合: ${collectionName}`)
    
    // 先测试集合是否存在
    try {
      const testResult = await db.collection(collectionName).limit(1).get()
      console.log(`集合 ${collectionName} 存在，记录数: ${testResult.data.length}`)
    } catch (collectionError) {
      console.error(`集合 ${collectionName} 访问失败:`, collectionError)
      return { code: -1, msg: `无法访问集合 ${collectionName}: ${collectionError.message}` }
    }
    
    const templateData = {
      ...data,
      createBy: openid,
      createTime: new Date(),
      updateTime: new Date()
    }
    
    // 删除不需要的字段
    delete templateData.templateType
    delete templateData.action
    
    console.log('准备插入的数据:', JSON.stringify(templateData, null, 2))
    
    const result = await db.collection(collectionName).add({
      data: templateData
    })
    
    console.log(`模板创建成功，ID: ${result._id}`)
    
    templateData._id = result._id
    return { code: 0, msg: '创建成功', data: templateData }
  } catch (error) {
    console.error('=== 模板创建失败 ===')
    console.error('错误信息:', error.message)
    console.error('错误代码:', error.code)
    console.error('错误堆栈:', error.stack)
    console.error('用户openid:', openid)
    console.error('输入数据:', data)
    
    // 返回更详细的错误信息
    let errorMsg = `创建模板数据失败`
    if (error.code === 'DATABASE_COLLECTION_NOT_EXIST') {
      errorMsg = `数据库集合不存在，请先创建 ${data.templateType === 'reward' ? 'reward_templates' : 'task_templates'} 集合`
    } else if (error.code === 'DATABASE_PERMISSION_DENIED') {
      errorMsg = `数据库权限不足，请检查集合权限设置`
    } else if (error.code === 'INVALID_PARAM') {
      errorMsg = `参数错误: ${error.message}`
    } else {
      errorMsg = `创建模板数据失败: ${error.message}`
    }
    
    return { code: -1, msg: errorMsg }
  }
}

async function updateTemplateData(openid, data) {
  try {
    const { templateType, _id } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    // 验证权限
    const templateResult = await db.collection(collectionName).doc(_id).get()
    
    if (templateResult.data.length === 0) {
      return { code: -1, msg: '模板数据不存在' }
    }
    
    const template = templateResult.data[0]
    
    if (template.createBy !== openid) {
      return { code: -1, msg: '权限不足' }
    }
    
    // 更新模板数据
    const updateData = {
      ...data,
      updateTime: new Date()
    }
    
    // 删除不需要更新的字段
    delete updateData._id
    delete updateData.templateType
    delete updateData.createBy
    delete updateData.createTime
    
    await db.collection(collectionName).doc(_id).update({
      data: updateData
    })
    
    return { code: 0, msg: '更新成功' }
  } catch (error) {
    console.error('updateTemplateData error:', error)
    return { code: -1, msg: '更新模板数据失败' }
  }
}

async function deleteTemplateData(openid, data) {
  try {
    const { templateType, _id } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    // 验证权限
    const templateResult = await db.collection(collectionName).doc(_id).get()
    
    if (templateResult.data.length === 0) {
      return { code: -1, msg: '模板数据不存在' }
    }
    
    const template = templateResult.data[0]
    
    if (template.createBy !== openid) {
      return { code: -1, msg: '权限不足' }
    }
    
    // 删除模板数据
    await db.collection(collectionName).doc(_id).remove()
    
    return { code: 0, msg: '删除成功' }
  } catch (error) {
    console.error('deleteTemplateData error:', error)
    return { code: -1, msg: '删除模板数据失败' }
  }
}

async function getTemplateData(data) {
  try {
    const { templateType, _id } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    const result = await db.collection(collectionName).doc(_id).get()
    
    if (result.data.length === 0) {
      return { code: -1, msg: '模板数据不存在' }
    }
    
    return { code: 0, msg: 'success', data: result.data[0] }
  } catch (error) {
    console.error('getTemplateData error:', error)
    return { code: -1, msg: '获取模板数据失败' }
  }
}

// 应用模板到多个儿童
async function applyTemplateToChildren(openid, data) {
  try {
    console.log('=== 开始应用模板到儿童 ===')
    console.log('openid:', openid)
    console.log('输入数据:', JSON.stringify(data, null, 2))
    
    const { templateType, templateId, childIds } = data
    
    // 验证参数
    if (!templateType || !templateId || !childIds || !Array.isArray(childIds) || childIds.length === 0) {
      return { code: -1, msg: '参数不完整' }
    }
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    // 获取模板数据
    const templateResult = await db.collection(collectionName).where({
      templateId: templateId
    }).get()
    
    if (templateResult.data.length === 0) {
      return { code: -1, msg: '模板不存在' }
    }
    
    const template = templateResult.data[0]
    
    // 验证模板是否启用
    if (!template.isActive) {
      return { code: -1, msg: '模板未启用，无法应用' }
    }
    
    // 验证儿童是否存在
    const childrenResult = await db.collection('children')
      .where({
        _id: db.command.in(childIds),
        parentId: openid
      })
      .get()
    
    if (childrenResult.data.length !== childIds.length) {
      return { code: -1, msg: '部分儿童不存在或权限不足' }
    }
    
    const successResults = []
    const errorResults = []
    
    // 为每个儿童创建对应的任务或奖励
    for (const childId of childIds) {
      try {
        if (templateType === 'task') {
          // 创建任务
          const taskData = {
            parentId: openid,
            childIds: [childId],
            name: template.name,
            description: template.description,
            taskType: template.taskType || 'daily',
            cycleType: template.cycleType || 'daily',
            points: template.points || 10,
            habitTags: template.habitTags || [],
            tips: template.tips || '',
            difficulty: template.difficulty || 'easy',
            category: template.category || 'study',
            status: 'active',
            createBy: openid,
            createTime: new Date(),
            updateTime: new Date(),
            sourceTemplateId: templateId
          }
          
          const taskResult = await db.collection('tasks').add({
            data: taskData
          })
          
          successResults.push({
            childId,
            taskId: taskResult._id,
            taskName: template.name
          })
          
        } else if (templateType === 'reward') {
          // 创建奖励
          const rewardData = {
            parentId: openid,
            childIds: [childId], // 正确设置childIds字段
            name: template.name,
            description: template.description,
            rewardType: template.rewardType || 'physical',
            pointsRequired: template.pointsRequired || 50,
            stock: template.recommendedStock || 10, // 使用stock字段而不是currentStock
            status: 'active', // 使用status字段而不是isActive
            createBy: openid,
            createTime: new Date(),
            updateTime: new Date(),
            sourceTemplateId: templateId
          }
          
          const rewardResult = await db.collection('rewards').add({
            data: rewardData
          })
          
          successResults.push({
            childId,
            rewardId: rewardResult._id,
            rewardName: template.name
          })
        }
        
      } catch (childError) {
        console.error(`应用模板到儿童 ${childId} 失败:`, childError)
        errorResults.push({
          childId,
          error: childError.message
        })
      }
    }
    
    // 记录应用历史
    try {
      await db.collection('template_usage_records').add({
        data: {
          templateId,
          templateType,
          templateName: template.name,
          operatedBy: openid,
          childIds,
          successCount: successResults.length,
          errorCount: errorResults.length,
          operationType: 'apply',
          createTime: new Date()
        }
      })
    } catch (recordError) {
      console.error('记录应用历史失败:', recordError)
    }
    
    return {
      code: 0,
      msg: `模板应用完成，成功: ${successResults.length}，失败: ${errorResults.length}`,
      data: {
        successResults,
        errorResults,
        templateName: template.name,
        totalChildren: childIds.length
      }
    }
    
  } catch (error) {
    console.error('applyTemplateToChildren error:', error)
    return { code: -1, msg: `应用模板失败: ${error.message}` }
  }
}

// 批量应用模板
async function applyBatchTemplates(openid, data) {
  try {
    const { templates } = data
    
    if (!templates || !Array.isArray(templates) || templates.length === 0) {
      return { code: -1, msg: '模板数据不完整' }
    }
    
    const results = []
    
    for (const template of templates) {
      try {
        const result = await applyTemplateToChildren(openid, template)
        results.push({
          templateId: template.templateId,
          ...result
        })
      } catch (error) {
        results.push({
          templateId: template.templateId,
          code: -1,
          msg: error.message
        })
      }
    }
    
    return {
      code: 0,
      msg: '批量应用完成',
      data: { results }
    }
    
  } catch (error) {
    console.error('applyBatchTemplates error:', error)
    return { code: -1, msg: `批量应用失败: ${error.message}` }
  }
}

// 获取应用历史
async function getApplicationHistory(data) {
  try {
    const { childId } = data
    
    let query = db.collection('template_usage_records')
    
    if (childId) {
      query = query.where({
        childIds: db.command.in([childId])
      })
    }
    
    const result = await query
      .orderBy('createTime', 'desc')
      .limit(50)
      .get()
    
    return {
      code: 0,
      msg: 'success',
      data: result.data
    }
    
  } catch (error) {
    console.error('getApplicationHistory error:', error)
    return { code: -1, msg: `获取应用历史失败: ${error.message}` }
  }
}

// 切换模板状态
async function toggleTemplateStatus(openid, data) {
  try {
    const { _id, isActive } = data
    
    if (!_id) {
      return { code: -1, msg: '缺少模板ID' }
    }
    
    // 查找模板在哪个集合中
    let templateResult = await db.collection('task_templates').doc(_id).get()
    let collectionName = 'task_templates'
    
    if (templateResult.data.length === 0) {
      templateResult = await db.collection('reward_templates').doc(_id).get()
      collectionName = 'reward_templates'
      
      if (templateResult.data.length === 0) {
        return { code: -1, msg: '模板不存在' }
      }
    }
    
    const template = templateResult.data[0]
    
    // 验证权限
    if (template.createBy !== openid) {
      return { code: -1, msg: '权限不足' }
    }
    
    // 更新状态
    await db.collection(collectionName).doc(_id).update({
      data: {
        isActive: isActive,
        updateTime: new Date()
      }
    })
    
    return {
      code: 0,
      msg: isActive ? '模板已启用' : '模板已禁用'
    }
    
  } catch (error) {
    console.error('toggleTemplateStatus error:', error)
    return { code: -1, msg: `切换状态失败: ${error.message}` }
  }
}

// 获取模板统计
async function getTemplateStats() {
  try {
    const [taskStats, rewardStats, usageStats] = await Promise.all([
      db.collection('task_templates').count(),
      db.collection('reward_templates').count(),
      db.collection('template_usage_records').count()
    ])
    
    return {
      code: 0,
      msg: 'success',
      data: {
        taskTemplatesCount: taskStats.total,
        rewardTemplatesCount: rewardStats.total,
        usageRecordsCount: usageStats.total
      }
    }
    
  } catch (error) {
    console.error('getTemplateStats error:', error)
    return { code: -1, msg: `获取统计失败: ${error.message}` }
  }
}

// 获取模板包组列表
async function getPackageGroups(filters = {}) {
  try {
    const { templateType } = filters
    console.log('=== 开始获取包组列表 ===')
    console.log('filters:', filters)
    
    // 获取任务模板的包组 - 使用更宽松的查询条件
    const taskResult = await db.collection('task_templates')
      .where({
        isInPackage: true
      })
      .field({
        packageGroup: true,
        packageName: true
      })
      .get()
    
    console.log('任务模板包组查询结果:', taskResult.data)
    
    // 获取奖励模板的包组 - 使用更宽松的查询条件
    const rewardResult = await db.collection('reward_templates')
      .where({
        isInPackage: true
      })
      .field({
        packageGroup: true,
        packageName: true
      })
      .get()
    
    console.log('奖励模板包组查询结果:', rewardResult.data)
    
    // 如果没有找到，尝试不使用 isInPackage 条件
    if (taskResult.data.length === 0 && rewardResult.data.length === 0) {
      console.log('未找到 isInPackage: true 的记录，尝试查询所有包含 packageGroup 字段的记录')
      
      const allTaskResult = await db.collection('task_templates')
        .where({
          packageGroup: db.command.exists(true)
        })
        .field({
          packageGroup: true,
          packageName: true,
          isInPackage: true
        })
        .get()
      
      const allRewardResult = await db.collection('reward_templates')
        .where({
          packageGroup: db.command.exists(true)
        })
        .field({
          packageGroup: true,
          packageName: true,
          isInPackage: true
        })
        .get()
      
      console.log('所有任务模板包组记录:', allTaskResult.data)
      console.log('所有奖励模板包组记录:', allRewardResult.data)
      
      // 使用这些结果
      taskResult.data = allTaskResult.data
      rewardResult.data = allRewardResult.data
    }
    
    // 检查原始数据
    console.log('原始任务数据:', taskResult.data)
    console.log('原始奖励数据:', rewardResult.data)
    
    // 合并并去重，统计数量
    const packageGroups = {}
    
    // 统计任务模板
    taskResult.data.forEach(template => {
      console.log('处理任务模板:', template)
      const groupKey = template.packageGroup
      if (!groupKey) {
        console.log('跳过没有 packageGroup 的任务模板')
        return
      }
      if (!packageGroups[groupKey]) {
        packageGroups[groupKey] = {
          packageGroup: groupKey,
          packageName: template.packageName || groupKey,
          templateTypes: [],
          taskCount: 0,
          rewardCount: 0
        }
      }
      packageGroups[groupKey].taskCount++
      if (!packageGroups[groupKey].templateTypes.includes('task')) {
        packageGroups[groupKey].templateTypes.push('task')
      }
    })
    
    // 统计奖励模板
    rewardResult.data.forEach(template => {
      console.log('处理奖励模板:', template)
      const groupKey = template.packageGroup
      if (!groupKey) {
        console.log('跳过没有 packageGroup 的奖励模板')
        return
      }
      if (!packageGroups[groupKey]) {
        packageGroups[groupKey] = {
          packageGroup: groupKey,
          packageName: template.packageName || groupKey,
          templateTypes: [],
          taskCount: 0,
          rewardCount: 0
        }
      }
      packageGroups[groupKey].rewardCount++
      if (!packageGroups[groupKey].templateTypes.includes('reward')) {
        packageGroups[groupKey].templateTypes.push('reward')
      }
    })
    
    console.log('合并后的包组数据:', packageGroups)
    
    // 按模板类型过滤
    let result = Object.values(packageGroups)
    if (templateType === 'task') {
      result = result.filter(group => group.templateTypes.includes('task'))
    } else if (templateType === 'reward') {
      result = result.filter(group => group.templateTypes.includes('reward'))
    }
    
    return { code: 0, data: result }
    
  } catch (error) {
    console.error('getPackageGroups error:', error)
    return { code: -1, msg: `获取包组失败: ${error.message}` }
  }
}

// 应用模板包组到儿童
async function applyPackageGroup(openid, data) {
  try {
    console.log('=== 开始应用包组 ===')
    console.log('收到参数:', { openid, data })
    
    const { packageGroup, childIds, templateType } = data
    
    console.log('解析参数:', { packageGroup, childIds, templateType })
    
    if (!packageGroup || !childIds || childIds.length === 0) {
      console.log('参数验证失败:', { packageGroup: !!packageGroup, childIds: childIds?.length })
      return { code: -1, msg: '参数错误' }
    }
    
    // 验证用户权限
    
 
    
    // 获取包组内的所有模板
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    console.log('查询模板集合:', collectionName, '包组:', packageGroup)
    
    // 先尝试不使用 orderBy 查询
    console.log('开始查询模板数据...')
    let templatesResult
    try {
      templatesResult = await db.collection(collectionName)
        .where({
          packageGroup: packageGroup,
          isActive: true
        })
        .get()
      
      console.log('查询到模板数量:', templatesResult.data.length)
      console.log('模板数据示例:', templatesResult.data.slice(0, 2)) // 打印前两个模板的数据结构
      
      if (templatesResult.data.length === 0) {
        console.log('包组内没有可用模板，包组:', packageGroup, '类型:', templateType)
        return { code: -1, msg: '包组内没有可用模板' }
      }
      
      // 如果需要排序，在内存中排序
      const sortedTemplates = templatesResult.data.sort((a, b) => {
        return (a.packageOrder || 0) - (b.packageOrder || 0)
      })
      
      // 替换原结果
      templatesResult.data = sortedTemplates
      console.log('排序后的模板数据:', sortedTemplates.slice(0, 2))
      
    } catch (queryError) {
      console.error('查询模板数据失败:', queryError)
      return { code: -1, msg: `查询模板失败: ${queryError.message}` }
    }
    
    // 验证儿童所有权
    console.log('验证儿童所有权, childIds:', childIds)
    const childrenResult = await db.collection('children')
      .where({
        _id: db.command.in(childIds),
        parentId: openid
      })
      .get()
    
    console.log('找到儿童数量:', childrenResult.data.length, '期望数量:', childIds.length)
    
    if (childrenResult.data.length !== childIds.length) {
      console.log('儿童权限验证失败')
      return { code: -1, msg: '无权限操作部分儿童' }
    }
    console.log('儿童验证通过')
    
    // 批量应用模板
    console.log('开始批量应用模板，模板数量:', templatesResult.data.length, '儿童数量:', childIds.length)
    const results = {
      successResults: [],
      errorResults: []
    }
    
    for (const template of templatesResult.data) {
      console.log('处理模板:', template.name, 'ID:', template._id)
      for (const childId of childIds) {
        try {
          if (templateType === 'task') {
            console.log('为儿童', childId, '创建任务:', template.name)
            // 创建任务
            const taskData = {
              name: template.name,
              description: template.description,
              category: template.category,
              ageGroup: template.ageGroup,
              taskType: template.taskType,
              cycleType: template.cycleType,
              points: template.points,
              habitTags: template.habitTags,
              tips: template.tips,
              difficulty: template.difficulty,
              challengeTarget: template.challengeTarget,
              challengeReward: template.challengeReward,
              childIds: [childId],
              parentId: openid,
              status: 'active',
              sourceTemplateId: template._id,
              sourcePackageGroup: packageGroup,
              createTime: new Date()
            }
            
            await db.collection('tasks').add({
              data: taskData
            })
            
          } else if (templateType === 'reward') {
            // 创建奖励
            const rewardData = {
              name: template.name,
              description: template.description,
              category: template.category,
              ageGroup: template.ageGroup,
              rewardType: template.rewardType,
              pointsRequired: template.pointsRequired,
              habitTags: template.habitTags,
              exchangeRules: template.exchangeRules,
              recommendedStock: template.recommendedStock,
              imageUrl: template.imageUrl,
              childIds: [childId],
              parentId: openid,
              status: 'active',
              sourceTemplateId: template._id,
              sourcePackageGroup: packageGroup,
              createTime: new Date()
            }
            
            await db.collection('rewards').add({
              data: rewardData
            })
          }
          
          results.successResults.push({
            templateId: template._id,
            templateName: template.name,
            childId: childId,
            success: true
          })
          
        } catch (error) {
          console.error('应用单个模板失败:', error)
          results.errorResults.push({
            templateId: template._id,
            templateName: template.name,
            childId: childId,
            error: error.message
          })
        }
      }
    }
    
    // 更新模板使用计数
    console.log('开始更新模板使用计数...')
    for (const template of templatesResult.data) {
      console.log('更新模板计数:', { templateId: template._id, templateName: template.name })
      if (!template._id) {
        console.error('模板缺少 _id 字段:', template)
        continue
      }
      try {
        await db.collection(collectionName).doc(template._id).update({
          data: {
            usage_count: db.command.inc(1),
            updateTime: new Date()
          }
        })
        console.log('模板计数更新成功:', template._id)
      } catch (updateError) {
        console.error('更新模板计数失败:', updateError)
      }
    }
    
    // 记录包组使用历史
    await db.collection('template_usage_records').add({
      data: {
        templateId: packageGroup,
        templateName: packageGroup,
        templateType: templateType,
        operatedBy: openid,
        childIds: childIds,
        successCount: results.successResults.length,
        errorCount: results.errorResults.length,
        operationType: 'apply_package_group',
        createTime: new Date()
      }
    })
    
    return {
      code: 0,
      data: results,
      msg: `包组应用完成，成功: ${results.successResults.length}，失败: ${results.errorResults.length}`
    }
    
  } catch (error) {
    console.error('applyPackageGroup error:', error)
    return { code: -1, msg: `应用包组失败: ${error.message}` }
  }
}

// 更新模板的包组信息
async function updateTemplatePackageGroup(openid, data) {
  try {
    console.log('=== 开始更新模板包组信息 ===')
    console.log('收到参数:', { openid, data })
    
    const { templateId, templateType, packageGroup, packageName, packageOrder } = data
    
    // 验证用户权限 - 使用与其他函数一致的查询方式
    const userResult = await db.collection('users').where({
      openid: openid
    }).get()
    if (userResult.data.length === 0) {
      console.log('用户不存在:', openid)
      return { code: -1, msg: '用户不存在' }
    }
    console.log('用户验证成功')
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    const updateData = {
      packageGroup: packageGroup,
      packageName: packageName,
      packageOrder: packageOrder,
      isInPackage: !!packageGroup,
      updateTime: new Date()
    }
    
    await db.collection(collectionName).doc(templateId).update({
      data: updateData
    })
    
    return { code: 0, msg: '包组信息更新成功' }
    
  } catch (error) {
    console.error('updateTemplatePackageGroup error:', error)
    return { code: -1, msg: `更新包组信息失败: ${error.message}` }
  }
}