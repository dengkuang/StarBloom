// 模板数据库集合初始化脚本
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    console.log('开始初始化模板数据库集合...')
    
    // 检查并创建 task_templates 集合
    try {
      await db.collection('task_templates').add({
        data: {
          name: '初始化检查记录',
          templateId: 'init_check',
          createBy: 'system',
          createTime: new Date(),
          updateTime: new Date(),
          isActive: false
        }
      })
      console.log('task_templates 集合创建成功')
    } catch (error) {
      if (error.code === 'DATABASE_COLLECTION_NOT_EXIST') {
        console.log('task_templates 集合不存在，请手动创建')
      } else {
        console.log('task_templates 集合已存在')
      }
    }
    
    // 检查并创建 reward_templates 集合
    try {
      await db.collection('reward_templates').add({
        data: {
          name: '初始化检查记录',
          templateId: 'init_check',
          createBy: 'system',
          createTime: new Date(),
          updateTime: new Date(),
          isActive: false
        }
      })
      console.log('reward_templates 集合创建成功')
    } catch (error) {
      if (error.code === 'DATABASE_COLLECTION_NOT_EXIST') {
        console.log('reward_templates 集合不存在，请手动创建')
      } else {
        console.log('reward_templates 集合已存在')
      }
    }
    
    // 检查并创建 template_import_export_records 集合
    try {
      await db.collection('template_import_export_records').add({
        data: {
          operationType: 'init',
          fileName: '初始化检查',
          operatedBy: 'system',
          createTime: new Date()
        }
      })
      console.log('template_import_export_records 集合创建成功')
    } catch (error) {
      if (error.code === 'DATABASE_COLLECTION_NOT_EXIST') {
        console.log('template_import_export_records 集合不存在，请手动创建')
      } else {
        console.log('template_import_export_records 集合已存在')
      }
    }
    
    return {
      code: 0,
      msg: '数据库集合检查完成',
      data: {
        message: '请确保以下集合存在并具有正确权限：task_templates, reward_templates, template_import_export_records'
      }
    }
  } catch (error) {
    console.error('数据库集合初始化失败:', error)
    return {
      code: -1,
      msg: `数据库集合初始化失败: ${error.message}`
    }
  }
}