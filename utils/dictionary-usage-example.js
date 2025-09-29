// 字典管理系统使用示例
const dictionaryManager = require('./dictionary-manager.js')

// 示例1: 在页面中使用奖励类型字典
Page({
  data: {
    rewardTypes: []
  },

  async onLoad() {
    // 加载奖励类型选项
    const rewardTypes = await dictionaryManager.getRewardTypeOptions()
    this.setData({ rewardTypes })
  },

  // 获取奖励类型显示名称
  getRewardTypeName(value) {
    return dictionaryManager.getRewardTypeName(value)
  }
})

// 示例2: 在组件中使用任务类型字典
Component({
  data: {
    taskTypes: []
  },

  lifetimes: {
    async attached() {
      // 加载任务类型选项
      const taskTypes = await dictionaryManager.getTaskTypeOptions()
      this.setData({ taskTypes })
    }
  },

  methods: {
    // 获取任务类型显示名称
    getTaskTypeName(value) {
      return dictionaryManager.getTaskTypeName(value)
    }
  }
})

// 示例3: 批量加载多个字典
async function loadAllDictionaries() {
  try {
    // 批量加载所有需要的字典
    await dictionaryManager.batchLoadDictionaries([
      'task_type',
      'reward_type',
      'difficulty_level',
      'age_group'
    ])

    // 现在可以同步获取所有字典选项
    const taskTypes = dictionaryManager.getTaskTypeOptions()
    const rewardTypes = dictionaryManager.getRewardTypeOptions()
    
    console.log('所有字典加载完成', {
      taskTypes,
      rewardTypes
    })
  } catch (error) {
    console.error('字典加载失败:', error)
  }
}

// 示例4: 在表单中使用字典
const FormPage = {
  data: {
    formData: {
      taskType: '',
      rewardType: ''
    },
    options: {
      taskTypes: [],
      rewardTypes: []
    }
  },

  async onLoad() {
    // 并行加载所有字典选项
    const [taskTypes, rewardTypes] = await Promise.all([
      dictionaryManager.getTaskTypeOptions(),
      dictionaryManager.getRewardTypeOptions()
    ])

    this.setData({
      'options.taskTypes': taskTypes,
      'options.rewardTypes': rewardTypes
    })
  },

  // 表单提交时验证字典值
  onSubmit() {
    const { taskType, rewardType } = this.data.formData

    // 验证字典值是否有效
    if (!dictionaryManager.isValidTaskType(taskType)) {
      wx.showToast({ title: '请选择有效的任务类型', icon: 'none' })
      return
    }

    if (!dictionaryManager.isValidRewardType(rewardType)) {
      wx.showToast({ title: '请选择有效的奖励类型', icon: 'none' })
      return
    }

    // 提交表单...
  }
}

// 示例5: 在数据处理中使用字典
function processTaskData(tasks) {
  return tasks.map(task => ({
    ...task,
    taskTypeName: dictionaryManager.getTaskTypeName(task.taskType),
    difficultyName: dictionaryManager.getDifficultyLevelName(task.difficulty)
  }))
}

// 示例6: 缓存管理
async function refreshDictionaries() {
  try {
    // 清除所有缓存
    dictionaryManager.clearCache()
    
    // 重新加载常用字典
    await dictionaryManager.batchLoadDictionaries([
      'task_type',
      'reward_type'
    ])
    
    wx.showToast({ title: '字典数据已更新', icon: 'success' })
  } catch (error) {
    wx.showToast({ title: '更新失败', icon: 'error' })
  }
}

module.exports = {
  FormPage,
  loadAllDictionaries,
  processTaskData,
  refreshDictionaries
}