// 部署字典管理云函数脚本
const path = require('path')

// 使用TCB工具部署云函数
async function deployDictionaryFunction() {
  try {
    console.log('开始部署字典管理云函数...')
    
    // 获取项目根目录
    const projectRoot = path.resolve(__dirname, '..')
    const functionPath = path.join(projectRoot, 'cloudfunctions')
    
    console.log('项目根目录:', projectRoot)
    console.log('云函数目录:', functionPath)
    
    // 这里需要使用TCB CLI或者其他部署工具
    // 由于我们使用的是TCB集成，可以通过以下方式部署：
    
    console.log('请使用以下命令手动部署云函数:')
    console.log('1. 确保已登录TCB环境')
    console.log('2. 在项目根目录执行以下命令:')
    console.log('   tcb functions:deploy manageDictionary')
    console.log('   或者使用微信开发者工具上传云函数')
    
    return {
      success: true,
      message: '部署指令已生成，请手动执行部署'
    }
  } catch (error) {
    console.error('部署失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// 验证云函数是否部署成功
async function verifyDeployment() {
  try {
    console.log('验证云函数部署状态...')
    
    // 这里可以调用云函数进行测试
    const testResult = await wx.cloud.callFunction({
      name: 'manageDictionary',
      data: {
        action: 'getAllCategories'
      }
    })
    
    if (testResult.result && testResult.result.code === 0) {
      console.log('云函数部署成功！')
      console.log('可用分类:', testResult.result.data)
      return true
    } else {
      console.error('云函数测试失败:', testResult)
      return false
    }
  } catch (error) {
    console.error('验证失败:', error)
    return false
  }
}

// 初始化字典数据
async function initializeDictionaryData() {
  try {
    console.log('初始化字典数据...')
    
    // 检查是否已有奖励类型数据
    const rewardTypesResult = await wx.cloud.callFunction({
      name: 'manageDictionary',
      data: {
        action: 'getByCategory',
        category: 'reward_type'
      }
    })
    
    if (rewardTypesResult.result.code === 0 && rewardTypesResult.result.data.length > 0) {
      console.log('奖励类型字典已存在，跳过初始化')
      return true
    }
    
    // 初始化奖励类型字典
    const rewardTypes = [
      { category: 'reward_type', code: 'physical', name: '实物奖励', value: 'physical' },
      { category: 'reward_type', code: 'privilege', name: '特权奖励', value: 'privilege' },
      { category: 'reward_type', code: 'experience', name: '体验奖励', value: 'experience' },
      { category: 'reward_type', code: 'virtual', name: '虚拟奖励', value: 'virtual' },
      { category: 'reward_type', code: 'charity', name: '公益奖励', value: 'charity' }
    ]
    
    for (const item of rewardTypes) {
      await wx.cloud.callFunction({
        name: 'manageDictionary',
        data: {
          action: 'add',
          data: item
        }
      })
    }
    
    console.log('字典数据初始化完成')
    return true
  } catch (error) {
    console.error('初始化字典数据失败:', error)
    return false
  }
}

// 主部署流程
async function main() {
  console.log('=== 字典管理系统部署流程 ===')
  
  // 1. 部署云函数
  const deployResult = await deployDictionaryFunction()
  if (!deployResult.success) {
    console.error('部署失败，流程终止')
    return
  }
  
  console.log('\n请先手动部署云函数，然后继续执行验证步骤...')
  console.log('部署完成后，可以调用以下函数进行验证:')
  console.log('verifyDeployment() - 验证部署')
  console.log('initializeDictionaryData() - 初始化数据')
}

// 如果是直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = {
  deployDictionaryFunction,
  verifyDeployment,
  initializeDictionaryData,
  main
}