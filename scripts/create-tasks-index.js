/**
 * 为tasks集合创建parentId_status_1索引
 * 在微信开发者工具的云开发控制台中执行
 */

// 在云开发控制台数据库页面执行以下代码：

async function createTasksIndex() {
  try {
    console.log('开始为tasks集合创建parentId_status_1索引...')
    
    // 检查tasks集合是否存在
    const tasksCollection = db.collection('tasks')
    const count = await tasksCollection.count()
    console.log(`tasks集合存在，当前文档数量: ${count.total}`)
    
    // 创建复合索引：parentId + status
    // 注意：在云开发控制台中，需要手动在界面上创建索引
    // 索引配置如下：
    const indexConfig = {
      name: 'parentId_status_1',
      keys: {
        parentId: 1,    // 升序
        status: 1       // 升序
      },
      description: '家长ID+状态复合索引，用于查询家长的有效任务'
    }
    
    console.log('索引配置:', JSON.stringify(indexConfig, null, 2))
    console.log('请在云开发控制台的数据库页面手动创建此索引')
    
    return {
      success: true,
      message: '索引配置已生成，请手动创建',
      config: indexConfig
    }
    
  } catch (error) {
    console.error('操作失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 执行函数
createTasksIndex().then(result => {
  console.log('结果:', result)
})

/**
 * 手动创建索引的步骤：
 * 
 * 1. 打开微信开发者工具
 * 2. 进入云开发控制台
 * 3. 选择"数据库"
 * 4. 找到"tasks"集合
 * 5. 点击"索引管理"
 * 6. 点击"添加索引"
 * 7. 配置索引：
 *    - 索引名称: parentId_status_1
 *    - 字段1: parentId (升序)
 *    - 字段2: status (升序)
 * 8. 点击"确定"创建
 */