// 模板导入调试页面
Page({
  data: {
    testResult: '',
    testing: false
  },

  // 测试单个模板导入
  async testSingleTemplate() {
    this.setData({ testing: true, testResult: '开始测试...' })
    
    try {
      this.addLog('=== 开始单个模板导入测试 ===')
      
      const testTemplate = {
        templateId: "test_template_001",
        name: "测试模板",
        description: "这是一个测试模板",
        category: "test",
        ageGroup: "test",
        ageRange: { min: 6, max: 8 },
        taskType: "daily",
        cycleType: "daily",
        points: 10,
        habitTags: ["测试"],
        tips: "这是一个测试模板",
        difficulty: "easy",
        isActive: true,
        sort_order: 1,
        usage_count: 0,
        version: 1
      }
      
      this.addLog(`测试模板数据: ${JSON.stringify(testTemplate, null, 2)}`)
      
      // 先检查集合状态
      this.addLog('检查集合状态...')
      const checkResult = await wx.cloud.callFunction({
        name: 'manageTemplateData',
        data: {
          action: 'list',
          templateType: 'task'
        }
      })
      this.addLog(`集合状态检查结果: ${JSON.stringify(checkResult.result, null, 2)}`)
      
      // 执行创建操作
      this.addLog('执行模板创建操作...')
      const result = await wx.cloud.callFunction({
        name: 'manageTemplateData',
        data: {
          action: 'create',
          templateType: 'task',
          ...testTemplate
        }
      })
      
      this.addLog(`云函数调用结果: ${JSON.stringify(result.result, null, 2)}`)
      
      if (result.result.code === 0) {
        this.addLog(`✓ 测试模板导入成功`, 'success')
        this.setData({ testResult: `测试成功: ${result.result.msg}` })
      } else {
        this.addLog(`✗ 测试模板导入失败: ${result.result.msg}`, 'error')
        this.setData({ testResult: `测试失败: ${result.result.msg}` })
      }
      
    } catch (error) {
      this.addLog(`✗ 测试调用失败: ${error.message}`, 'error')
      this.addLog(`错误详情: ${JSON.stringify(error, null, 2)}`, 'error')
      this.setData({ testResult: `调用失败: ${error.message}` })
    } finally {
      this.setData({ testing: false })
    }
  },

  // 测试数据库连接
  async testDatabaseConnection() {
    this.setData({ testing: true, testResult: '测试数据库连接...' })
    
    try {
      this.addLog('=== 开始数据库连接测试 ===')
      
      // 1. 测试 task_templates 集合
      this.addLog('1. 测试 task_templates 集合...')
      const taskResult = await wx.cloud.callFunction({
        name: 'manageTemplateData',
        data: {
          action: 'list',
          templateType: 'task'
        }
      })
      
      this.addLog(`task_templates 集合查询结果: ${JSON.stringify(taskResult.result, null, 2)}`)
      
      // 2. 测试 reward_templates 集合
      this.addLog('2. 测试 reward_templates 集合...')
      const rewardResult = await wx.cloud.callFunction({
        name: 'manageTemplateData',
        data: {
          action: 'list',
          templateType: 'reward'
        }
      })
      
      this.addLog(`reward_templates 集合查询结果: ${JSON.stringify(rewardResult.result, null, 2)}`)
      
      // 3. 测试 initDatabase 云函数
      this.addLog('3. 测试 initDatabase 云函数...')
      const initResult = await wx.cloud.callFunction({
        name: 'initDatabase',
        data: {
          action: 'init'
        }
      })
      
      this.addLog(`initDatabase 结果: ${JSON.stringify(initResult.result, null, 2)}`)
      
      // 4. 测试 initTemplateCollections 云函数
      this.addLog('4. 测试 initTemplateCollections 云函数...')
      const templateInitResult = await wx.cloud.callFunction({
        name: 'initTemplateCollections',
        data: {}
      })
      
      this.addLog(`initTemplateCollections 结果: ${JSON.stringify(templateInitResult.result, null, 2)}`)
      
      this.setData({ testResult: '数据库连接测试完成，请查看控制台日志' })
      
    } catch (error) {
      this.addLog(`✗ 数据库连接测试失败: ${error.message}`, 'error')
      this.addLog(`错误详情: ${JSON.stringify(error, null, 2)}`, 'error')
      this.setData({ testResult: `数据库连接失败: ${error.message}` })
    } finally {
      this.setData({ testing: false })
    }
  },

  // 初始化数据库集合
  async initCollections() {
    this.setData({ testing: true, testResult: '初始化数据库集合...' })
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'initTemplateCollections',
        data: {}
      })
      
      this.addLog(`集合初始化结果: ${JSON.stringify(result.result, null, 2)}`)
      this.setData({ testResult: result.result.msg })
      
    } catch (error) {
      this.addLog(`✗ 集合初始化失败: ${error.message}`, 'error')
      this.setData({ testResult: `初始化失败: ${error.message}` })
    } finally {
      this.setData({ testing: false })
    }
  },

  // 添加日志
  addLog(message, type = 'info') {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const logMessage = `[${time}] ${message}`
    console.log(logMessage)
    
    // 更新页面显示日志
    const currentResult = this.data.testResult || ''
    const newResult = currentResult + '\n' + logMessage
    this.setData({ testResult: newResult })
    
    // 显示简短的toast提示
    wx.showToast({
      title: message.length > 50 ? message.substring(0, 50) + '...' : message,
      icon: type === 'error' ? 'error' : 'success',
      duration: 2000
    })
  },

  // 清理测试数据
  async cleanupTestData() {
    this.setData({ testing: true, testResult: '清理测试数据...' })
    
    try {
      // 查找并删除测试模板
      const result = await wx.cloud.callFunction({
        name: 'manageTemplateData',
        data: {
          action: 'list',
          templateType: 'task'
        }
      })
      
      const testTemplates = result.result.data.filter(t => t.name === '测试模板' || t.templateId === 'test_template_001')
      
      for (const template of testTemplates) {
        await wx.cloud.callFunction({
          name: 'manageTemplateData',
          data: {
            action: 'delete',
            templateType: 'task',
            _id: template._id
          }
        })
        this.addLog(`删除测试模板: ${template.name}`)
      }
      
      this.setData({ testResult: `清理完成，删除了 ${testTemplates.length} 个测试模板` })
      
    } catch (error) {
      this.addLog(`✗ 清理失败: ${error.message}`, 'error')
      this.setData({ testResult: `清理失败: ${error.message}` })
    } finally {
      this.setData({ testing: false })
    }
  }
})