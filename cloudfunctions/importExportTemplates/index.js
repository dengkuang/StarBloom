// 模板导入导出功能云函数
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
      case 'import':
        return await importTemplates(wxContext.OPENID, data)
      case 'export':
        return await exportTemplates(wxContext.OPENID, data)
      case 'list':
        return await getImportExportRecords(wxContext.OPENID, data)
      default:
        return { code: -1, message: '未知操作' }
    }
  } catch (error) {
    console.error('importExportTemplates error:', error)
    return { code: -1, message: '系统错误，请稍后重试' }
  }
}

async function importTemplates(parentId, data) {
  try {
    const { templateType, templateData } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    // 验证数据格式
    if (!templateData || !Array.isArray(templateData)) {
      return { code: -1, message: '模板数据格式错误' }
    }
    
    // 导入模板数据
    let successCount = 0
    let failedCount = 0
    const failedRecords = []
    
    for (const template of templateData) {
      try {
        const templateRecord = {
          ...template,
          createBy: parentId,
          createTime: new Date(),
          updateTime: new Date()
        }
        
        await db.collection(collectionName).add({
          data: templateRecord
        })
        
        successCount++
      } catch (error) {
        failedCount++
        failedRecords.push({
          template: template,
          error: error.message
        })
      }
    }
    
    // 创建导入记录
    const importRecord = {
      operationType: 'import',
      fileType: 'json',
      fileName: `import_${templateType}_${new Date().getTime()}.json`,
      recordCount: templateData.length,
      successCount: successCount,
      failedCount: failedCount,
      operatedBy: parentId,
      status: failedCount > 0 ? 'partial' : 'success',
      errorMsg: failedCount > 0 ? JSON.stringify(failedRecords) : '',
      createTime: new Date()
    }
    
    await db.collection('template_import_export_records').add({
      data: importRecord
    })
    
    return { 
      code: 0, 
      message: '导入完成', 
      data: { 
        successCount, 
        failedCount, 
        importRecord 
      } 
    }
  } catch (error) {
    console.error('importTemplates error:', error)
    return { code: -1, message: '导入模板失败' }
  }
}

async function exportTemplates(parentId, data) {
  try {
    const { templateType, filters } = data
    
    const collectionName = templateType === 'reward' ? 'reward_templates' : 'task_templates'
    
    // 查询模板数据
    let query = db.collection(collectionName).where({
      createBy: parentId
    })
    
    // 应用过滤条件
    if (filters) {
      if (filters.category) {
        query = query.where({
          category: filters.category
        })
      }
      
      if (filters.isActive !== undefined) {
        query = query.where({
          isActive: filters.isActive
        })
      }
    }
    
    const result = await query.get()
    
    // 创建导出记录
    const exportRecord = {
      operationType: 'export',
      fileType: 'json',
      fileName: `export_${templateType}_${new Date().getTime()}.json`,
      recordCount: result.data.length,
      operatedBy: parentId,
      status: 'success',
      createTime: new Date()
    }
    
    await db.collection('template_import_export_records').add({
      data: exportRecord
    })
    
    return { 
      code: 0, 
      message: '导出成功', 
      data: { 
        templateData: result.data,
        exportRecord 
      } 
    }
  } catch (error) {
    console.error('exportTemplates error:', error)
    
    // 创建失败的导出记录
    const exportRecord = {
      operationType: 'export',
      fileType: 'json',
      fileName: `export_${new Date().getTime()}.json`,
      recordCount: 0,
      operatedBy: parentId,
      status: 'failed',
      errorMsg: error.message,
      createTime: new Date()
    }
    
    await db.collection('template_import_export_records').add({
      data: exportRecord
    })
    
    return { code: -1, message: '导出模板失败' }
  }
}

async function getImportExportRecords(parentId, filters) {
  try {
    let query = db.collection('template_import_export_records').where({
      operatedBy: parentId
    })
    
    // 应用过滤条件
    if (filters) {
      if (filters.operationType) {
        query = query.where({
          operationType: filters.operationType
        })
      }
      
      if (filters.status) {
        query = query.where({
          status: filters.status
        })
      }
    }
    
    // 按创建时间倒序排列
    query = query.orderBy('createTime', 'desc')
    
    const result = await query.get()
    
    return { code: 0, message: 'success', data: result.data }
  } catch (error) {
    console.error('getImportExportRecords error:', error)
    return { code: -1, message: '获取导入导出记录失败' }
  }
}