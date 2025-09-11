// 预设模板管理云函数
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
        return await getTemplateList(data)
      case 'create':
        return await createTemplate(wxContext.OPENID, data)
      case 'update':
        return await updateTemplate(wxContext.OPENID, data)
      case 'delete':
        return await deleteTemplate(wxContext.OPENID, data)
      case 'apply':
        return await applyTemplate(wxContext.OPENID, data)
      default:
        return { code: -1, msg: '未知操作' }
    }
  } catch (error) {
    console.error('manageTemplates error:', error)
    return { code: -1, msg: '系统错误，请稍后重试' }
  }
}

async function getTemplateList(filters) {
  try {
    const { templateType } = filters || {}
    
    let query = db.collection(templateType === 'reward' ? 'reward_templates' : 'task_templates').where({
      isActive: true
    })
    
    // 应用过滤条件
    if (filters) {
      if (filters.category) {
        query = query.where({
          category: filters.category
        })
      }
      
      if (filters.ageGroup) {
        query = query.where({
          ageGroup: filters.ageGroup
        })
      }
    }
    
    // 按排序权重和使用次数排序
    query = query.orderBy('sort_order', 'asc').orderBy('usage_count', 'desc')
    
    const result = await query.get()
    
    return { code: 0, msg: 'success', data: result.data }
  } catch (error) {
    console.error('getTemplateList error:', error)
    return { code: -1, msg: '获取模板列表失败' }
  }
}

async function createTemplate(openid, data) {
  try {
    const { templateType } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    const templateData = {
      templateId: data.templateId || generateTemplateId(),
      name: data.name,
      description: data.description || '',
      category: data.category || '',
      ageGroup: data.ageGroup || '',
      ageRange: data.ageRange || { min: 6, max: 12 },
      isActive: true,
      sort_order: data.sort_order || 0,
      usage_count: 0,
      version: 1,
      createBy: openid,
      createTime: new Date(),
      updateTime: new Date()
    }
    
    // 根据模板类型添加特有字段
    if (templateType === 'task') {
      templateData.taskType = data.taskType || 'daily'
      templateData.cycleType = data.cycleType || 'daily'
      templateData.points = data.points || 0
      templateData.habitTags = data.habitTags || []
      templateData.tips = data.tips || ''
      templateData.difficulty = data.difficulty || 'easy'
      templateData.challengeTarget = data.challengeTarget || {}
      templateData.challengeReward = data.challengeReward || {}
    } else if (templateType === 'reward') {
      templateData.rewardType = data.rewardType || 'physical'
      templateData.pointsRequired = data.pointsRequired || 0
      templateData.habitTags = data.habitTags || []
      templateData.exchangeRules = data.exchangeRules || ''
      templateData.recommendedStock = data.recommendedStock || 0
      templateData.imageUrl = data.imageUrl || ''
    }
    
    const result = await db.collection(collectionName).add({
      data: templateData
    })
    
    templateData._id = result._id
    return { code: 0, msg: '创建成功', data: templateData }
  } catch (error) {
    console.error('createTemplate error:', error)
    return { code: -1, msg: '创建模板失败' }
  }
}

async function updateTemplate(openid, data) {
  try {
    const { templateType, _id } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    // 验证权限（只有创建者或系统模板可以更新）
    const templateResult = await db.collection(collectionName).doc(_id).get()
    
    if (templateResult.data.length === 0) {
      return { code: -1, msg: '模板不存在' }
    }
    
    const template = templateResult.data[0]
    
    if (template.createBy !== 'system' && template.createBy !== openid) {
      return { code: -1, msg: '权限不足' }
    }
    
    // 更新模板信息
    const updateData = {
      name: data.name,
      description: data.description,
      category: data.category,
      ageGroup: data.ageGroup,
      ageRange: data.ageRange,
      isActive: data.isActive,
      sort_order: data.sort_order,
      updateTime: new Date(),
      version: _.inc(1)
    }
    
    // 根据模板类型更新特有字段
    if (templateType === 'task') {
      updateData.taskType = data.taskType
      updateData.cycleType = data.cycleType
      updateData.points = data.points
      updateData.habitTags = data.habitTags
      updateData.tips = data.tips
      updateData.difficulty = data.difficulty
      updateData.challengeTarget = data.challengeTarget
      updateData.challengeReward = data.challengeReward
    } else if (templateType === 'reward') {
      updateData.rewardType = data.rewardType
      updateData.pointsRequired = data.pointsRequired
      updateData.habitTags = data.habitTags
      updateData.exchangeRules = data.exchangeRules
      updateData.recommendedStock = data.recommendedStock
      updateData.imageUrl = data.imageUrl
    }
    
    await db.collection(collectionName).doc(_id).update({
      data: updateData
    })
    
    return { code: 0, msg: '更新成功' }
  } catch (error) {
    console.error('updateTemplate error:', error)
    return { code: -1, msg: '更新模板失败' }
  }
}

async function deleteTemplate(openid, data) {
  try {
    const { templateType, _id } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    // 验证权限（只有创建者或系统模板可以删除）
    const templateResult = await db.collection(collectionName).doc(_id).get()
    
    if (templateResult.data.length === 0) {
      return { code: -1, msg: '模板不存在' }
    }
    
    const template = templateResult.data[0]
    
    if (template.createBy !== 'system' && template.createBy !== openid) {
      return { code: -1, msg: '权限不足' }
    }
    
    // 软删除模板（设置为非激活状态）
    await db.collection(collectionName).doc(_id).update({
      data: {
        isActive: false,
        updateTime: new Date()
      }
    })
    
    return { code: 0, msg: '删除成功' }
  } catch (error) {
    console.error('deleteTemplate error:', error)
    return { code: -1, msg: '删除模板失败' }
  }
}

async function applyTemplate(parentId, data) {
  try {
    const { templateType, templateId, childIds, modifications } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    // 获取模板详情
    const templateResult = await db.collection(collectionName).where({
      _id: templateId,
      isActive: true
    }).get()
    
    if (templateResult.data.length === 0) {
      return { code: -1, msg: '模板不存在或未启用' }
    }
    
    const template = templateResult.data[0]
    
    // 创建使用记录
    const usageRecords = []
    
    // 根据模板类型创建实际项目
    if (templateType === 'task') {
      // 为每个儿童创建任务
      for (const childId of childIds) {
        // 验证儿童是否存在且属于当前家长
        const childResult = await db.collection('children').where({
          _id: childId,
          parentId: parentId
        }).get()
        
        if (childResult.data.length === 0) {
          continue // 跳过无效的儿童
        }
        
        // 创建任务
        const taskData = {
          name: modifications && modifications.name ? modifications.name : template.name,
          description: modifications && modifications.description ? modifications.description : template.description,
          points: modifications && modifications.points ? modifications.points : template.points,
          taskType: template.taskType,
          cycleType: template.cycleType,
          status: 'active',
          parentId: parentId,
          childIds: [childId],
          createTime: new Date(),
          updateTime: new Date()
        }
        
        const taskResult = await db.collection('tasks').add({
          data: taskData
        })
        
        // 创建使用记录
        const usageRecord = {
          templateId: templateId,
          templateType: 'task',
          parentId: parentId,
          childId: childId,
          actualItemId: taskResult._id,
          usageType: 'single',
          modifications: modifications || {},
          createTime: new Date()
        }
        
        await db.collection('template_usage_records').add({
          data: usageRecord
        })
        
        usageRecords.push(usageRecord)
      }
    } else if (templateType === 'reward') {
      // 创建奖励
      const rewardData = {
        name: modifications && modifications.name ? modifications.name : template.name,
        description: modifications && modifications.description ? modifications.description : template.description,
        pointsRequired: modifications && modifications.pointsRequired ? modifications.pointsRequired : template.pointsRequired,
        rewardType: template.rewardType,
        stock: modifications && modifications.stock ? modifications.stock : template.recommendedStock,
        status: 'active',
        parentId: parentId,
        createTime: new Date(),
        updateTime: new Date()
      }
      
      const rewardResult = await db.collection('rewards').add({
        data: rewardData
      })
      
      // 为每个儿童创建使用记录
      for (const childId of childIds) {
        // 验证儿童是否存在且属于当前家长
        const childResult = await db.collection('children').where({
          _id: childId,
          parentId: parentId
        }).get()
        
        if (childResult.data.length === 0) {
          continue // 跳过无效的儿童
        }
        
        // 创建使用记录
        const usageRecord = {
          templateId: templateId,
          templateType: 'reward',
          parentId: parentId,
          childId: childId,
          actualItemId: rewardResult._id,
          usageType: 'single',
          modifications: modifications || {},
          createTime: new Date()
        }
        
        await db.collection('template_usage_records').add({
          data: usageRecord
        })
        
        usageRecords.push(usageRecord)
      }
    }
    
    // 更新模板使用次数
    await db.collection(collectionName).doc(templateId).update({
      data: {
        usage_count: _.inc(childIds.length),
        updateTime: new Date()
      }
    })
    
    return { code: 0, msg: '应用模板成功', data: { usageRecords } }
  } catch (error) {
    console.error('applyTemplate error:', error)
    return { code: -1, msg: '应用模板失败' }
  }
}

// 生成模板ID
function generateTemplateId() {
  return 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}