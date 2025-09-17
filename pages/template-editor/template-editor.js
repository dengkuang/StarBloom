// pages/template-editor/template-editor.js
// 模板编辑器页面逻辑
const { templatesApi, dictionaryApi } = require('../../utils/api-services.js')

Page({
  data: {
    templateType: 'task', // 'task' 或 'reward'
    isEdit: false,
    templateId: '',
    loading: false,
    
    // 计算的索引值
    ageGroupIndex: 0,
    categoryIndex: 0,
    taskTypeIndex: 0,
    cycleTypeIndex: 0,
    rewardTypeIndex: 0,
    difficultyIndex: 0,
    
    // 表单数据
    formData: {
      name: '',
      description: '',
      templateId: '',
      ageGroup: 'grade1',
      category: 'study',
      isActive: true,
      sort_order: 1,
      habitTags: [],
      tips: '',
      // 包组相关字段
      packageGroup: '',
      packageName: '',
      packageOrder: 1,
      isInPackage: false
    },
    
    // 任务特有字段
    taskFields: {
      taskType: 'daily',
      cycleType: 'daily',
      points: 10,
      difficulty: 'easy'
    },
    
    // 奖励特有字段
    rewardFields: {
      rewardType: 'physical',
      pointsRequired: 50,
      exchangeRules: '',
      recommendedStock: 10
    },
    
    // 选项数据
    ageGroups: [
      { value: 'grade1', label: '一年级(6-8岁)' },
      { value: 'grade2', label: '二年级(7-9岁)' },
      { value: 'grade3', label: '三年级(8-10岁)' },
      { value: 'grade4', label: '四年级(9-11岁)' },
      { value: 'grade5', label: '五年级(10-12岁)' },
      { value: 'grade6', label: '六年级(11-13岁)' }
    ],
    
    categories: [
      { value: 'study', label: '学习' },
      { value: 'life', label: '生活' },
      { value: 'exercise', label: '运动' },
      { value: 'social', label: '社交' },
      { value: 'family', label: '家庭' },
      { value: 'entertainment', label: '娱乐' },
      { value: 'study_supplies', label: '学习用品' }
    ],
    
    taskTypes: [],
    cycleTypes: [],
    rewardTypes: [],
    difficulties: [
      { value: 'easy', label: '简单' },
      { value: 'medium', label: '中等' },
      { value: 'hard', label: '困难' }
    ],
    
    // 标签相关
    tagInput: '',
    availableTags: [
      '学习', '生活', '运动', '社交', '家庭', '娱乐', '自律', '健康',
      '阅读', '整理', '清洁', '助人', '礼貌', '创意', '合作'
    ]
  },

  onLoad: function(options) {
    const { type, id } = options
    
    this.setData({ 
      templateType: type || 'task',
      isEdit: !!id,
      templateId: id || ''
    })
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: id ? '编辑模板' : '创建模板'
    })
    
    this.loadDictionaryData()
    
    if (id) {
      this.loadTemplateData(id)
    } else {
      // 生成默认模板ID
      const defaultTemplateId = `${type}_template_${Date.now()}`
      this.setData({
        'formData.templateId': defaultTemplateId
      })
      // 设置默认索引值
      this.setDefaultIndexes()
    }
  },

  // 设置默认索引值
  setDefaultIndexes: function() {
    this.setData({
      ageGroupIndex: 0,
      categoryIndex: 0,
      taskTypeIndex: 0,
      cycleTypeIndex: 0,
      rewardTypeIndex: 0,
      difficultyIndex: 0
    })
  },

  // 加载字典数据
  async loadDictionaryData() {
    try {
      const [taskTypesResult, cycleTypesResult, rewardTypesResult] = await Promise.all([
        dictionaryApi.getByCategory('task_type'),
        dictionaryApi.getByCategory('cycle_type'),
        dictionaryApi.getByCategory('reward_type')
      ])

      if (taskTypesResult.code === 0) {
        this.setData({ taskTypes: taskTypesResult.data || [] })
      }

      if (cycleTypesResult.code === 0) {
        this.setData({ cycleTypes: cycleTypesResult.data || [] })
      }

      if (rewardTypesResult.code === 0) {
        this.setData({ rewardTypes: rewardTypesResult.data || [] })
      }
    } catch (error) {
      console.error('加载字典数据失败:', error)
    }
  },

  // 加载模板数据
  async loadTemplateData(id) {
    this.setData({ loading: true })
    
    try {
      const result = await templatesApi.getTaskTemplates({ _id: id })
      
      if (result.code === 0 && result.data.length > 0) {
        const template = result.data[0]
        this.setFormData(template)
      } else {
        // 尝试加载奖励模板
        const rewardResult = await templatesApi.getRewardTemplates({ _id: id })
        
        if (rewardResult.code === 0 && rewardResult.data.length > 0) {
          const template = rewardResult.data[0]
          this.setFormData(template)
        } else {
          wx.showToast({
            title: '模板不存在',
            icon: 'error'
          })
          wx.navigateBack()
        }
      }
    } catch (error) {
      console.error('加载模板数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 设置表单数据
  setFormData(template) {
    const formData = {
      name: template.name || '',
      description: template.description || '',
      templateId: template.templateId || '',
      ageGroup: template.ageGroup || 'grade1',
      category: template.category || 'study',
      isActive: template.isActive !== false,
      sort_order: template.sort_order || 1,
      habitTags: template.habitTags || [],
      tips: template.tips || ''
    }

    // 计算索引值
    const ageGroupIndex = this.data.ageGroups.findIndex(item => item.value === formData.ageGroup)
    const categoryIndex = this.data.categories.findIndex(item => item.value === formData.category)

    if (this.data.templateType === 'task') {
      const taskTypeIndex = this.data.taskTypes.findIndex(item => item.value === (template.taskType || 'daily'))
      const cycleTypeIndex = this.data.cycleTypes.findIndex(item => item.value === (template.cycleType || 'daily'))
      const difficultyIndex = this.data.difficulties.findIndex(item => item.value === (template.difficulty || 'easy'))
      
      this.setData({
        formData,
        ageGroupIndex: ageGroupIndex >= 0 ? ageGroupIndex : 0,
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        taskTypeIndex: taskTypeIndex >= 0 ? taskTypeIndex : 0,
        cycleTypeIndex: cycleTypeIndex >= 0 ? cycleTypeIndex : 0,
        difficultyIndex: difficultyIndex >= 0 ? difficultyIndex : 0,
        taskFields: {
          taskType: template.taskType || 'daily',
          cycleType: template.cycleType || 'daily',
          points: template.points || 10,
          difficulty: template.difficulty || 'easy'
        }
      })
    } else {
      const rewardTypeIndex = this.data.rewardTypes.findIndex(item => item.value === (template.rewardType || 'physical'))
      
      this.setData({
        formData,
        ageGroupIndex: ageGroupIndex >= 0 ? ageGroupIndex : 0,
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        rewardTypeIndex: rewardTypeIndex >= 0 ? rewardTypeIndex : 0,
        rewardFields: {
          rewardType: template.rewardType || 'physical',
          pointsRequired: template.pointsRequired || 50,
          exchangeRules: template.exchangeRules || '',
          recommendedStock: template.recommendedStock || 10
        }
      })
    }
  },

  // 表单输入处理
  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      this.setData({
        [`${parent}.${child}`]: value
      })
    } else {
      this.setData({
        [`formData.${field}`]: value
      })
    }
  },

  // 包组开关切换
  onPackageToggle: function(e) {
    const value = e.detail.value
    this.setData({
      'formData.isInPackage': value
    })
    
    // 如果关闭包组，清空包组字段
    if (!value) {
      this.setData({
        'formData.packageGroup': '',
        'formData.packageName': '',
        'formData.packageOrder': 1
      })
    }
  },

  // 选择器改变
  onPickerChange: function(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      const options = (parent === 'taskFields' ? this.data.taskTypes : 
                       parent === 'rewardFields' ? this.data.rewardTypes :
                       field === 'ageGroup' ? this.data.ageGroups :
                       field === 'category' ? this.data.categories : [])
      const selectedOption = options[value]
      
      // 更新索引值和实际值
      if (parent === 'taskFields') {
        if (child === 'taskType') {
          this.setData({ taskTypeIndex: value })
        } else if (child === 'cycleType') {
          this.setData({ cycleTypeIndex: value })
        } else if (child === 'difficulty') {
          this.setData({ difficultyIndex: value })
        }
      } else if (parent === 'rewardFields') {
        if (child === 'rewardType') {
          this.setData({ rewardTypeIndex: value })
        }
      }
      
      this.setData({
        [`${parent}.${child}`]: selectedOption.value
      })
    } else {
      const options = (field === 'ageGroup' ? this.data.ageGroups :
                     field === 'category' ? this.data.categories :
                     field === 'taskType' ? this.data.taskTypes :
                     field === 'cycleType' ? this.data.cycleTypes :
                     field === 'difficulty' ? this.data.difficulties : [])
      const selectedOption = options[value]
      
      // 更新索引值
      if (field === 'ageGroup') {
        this.setData({ ageGroupIndex: value })
      } else if (field === 'category') {
        this.setData({ categoryIndex: value })
      }
      
      this.setData({
        [`formData.${field}`]: selectedOption.value
      })
    }
  },

  // 开关改变
  onSwitchChange: function(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 标签输入
  onTagInput: function(e) {
    this.setData({
      tagInput: e.detail.value
    })
  },

  // 添加标签
  addTag: function() {
    const tag = this.data.tagInput.trim()
    if (tag && !this.data.formData.habitTags.includes(tag)) {
      const habitTags = [...this.data.formData.habitTags, tag]
      this.setData({
        'formData.habitTags': habitTags,
        tagInput: ''
      })
    }
  },

  // 删除标签
  removeTag: function(e) {
    const tag = e.currentTarget.dataset.tag
    const habitTags = this.data.formData.habitTags.filter(t => t !== tag)
    this.setData({
      'formData.habitTags': habitTags
    })
  },

  // 选择可用标签
  selectAvailableTag: function(e) {
    const tag = e.currentTarget.dataset.tag
    if (!this.data.formData.habitTags.includes(tag)) {
      const habitTags = [...this.data.formData.habitTags, tag]
      this.setData({
        'formData.habitTags': habitTags
      })
    }
  },

  // 保存模板
  async saveTemplate() {
    if (!this.validateForm()) {
      return
    }

    this.setData({ loading: true })
    
    try {
      const templateData = {
        ...this.data.formData,
        ...this.data.taskFields,
        ...this.data.rewardFields,
        templateType: this.data.templateType
      }

      let result
      
      if (this.data.isEdit) {
        // 更新模板
        result = await templatesApi.updateTaskTemplate(this.data.templateId, templateData)
      } else {
        // 创建模板
        if (this.data.templateType === 'task') {
          result = await templatesApi.createTaskTemplate(templateData)
        } else {
          result = await templatesApi.createRewardTemplate(templateData)
        }
      }

      if (result.code === 0) {
        wx.showToast({
          title: this.data.isEdit ? '更新成功' : '创建成功',
          icon: 'success'
        })
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
        
      } else {
        wx.showToast({
          title: result.msg || '保存失败',
          icon: 'error'
        })
      }

    } catch (error) {
      console.error('保存模板失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 表单验证
  validateForm() {
    const { formData, taskFields, rewardFields } = this.data
    
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入模板名称',
        icon: 'none'
      })
      return false
    }
    
    if (!formData.description.trim()) {
      wx.showToast({
        title: '请输入模板描述',
        icon: 'none'
      })
      return false
    }
    
    if (!formData.templateId.trim()) {
      wx.showToast({
        title: '请输入模板ID',
        icon: 'none'
      })
      return false
    }
    
    if (this.data.templateType === 'task') {
      if (!taskFields.points || taskFields.points <= 0) {
        wx.showToast({
          title: '请输入有效的积分值',
          icon: 'none'
        })
        return false
      }
    } else {
      if (!rewardFields.pointsRequired || rewardFields.pointsRequired <= 0) {
        wx.showToast({
          title: '请输入有效的所需积分',
          icon: 'none'
        })
        return false
      }
    }
    
    return true
  },

  // 删除模板
  deleteTemplate() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个模板吗？此操作不可恢复。',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true })
          
          try {
            let result
            if (this.data.templateType === 'task') {
              result = await templatesApi.deleteTaskTemplate(this.data.templateId)
            } else {
              result = await templatesApi.deleteRewardTemplate(this.data.templateId)
            }

            if (result.code === 0) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            } else {
              wx.showToast({
                title: result.msg || '删除失败',
                icon: 'error'
              })
            }

          } catch (error) {
            console.error('删除模板失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            })
          } finally {
            this.setData({ loading: false })
          }
        }
      }
    })
  }
})