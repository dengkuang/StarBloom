// pages/template-management/template-management.js
// 模板管理页面逻辑
const { templatesApi, childrenApi } = require('../../utils/api-services.js')
const businessDataManager = require('../../utils/businessDataManager.js')

Page({
  data: {
    activeTab: 'task',
    taskTemplates: [],
    rewardTemplates: [],
    children: [],
    selectedChildren: [],
    loading: false,
    showChildSelector: false,
    currentTemplate: null,
    ageFilter: '',
    categoryFilter: '',
    ageFilterIndex: -1,
    categoryFilterIndex: -1,
    // 包组相关
    packageGroups: [],
    showPackageGroups: true,
    selectedPackageGroup: '',
    packageFilter: '',
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
      { value: 'family', label: '家庭' }
    ]
  },

  onLoad: function () {
    this.loadInitialData()
  },

  onShow: function () {
    // 页面显示时刷新数据
    this.loadTemplates()
  },

  // 加载初始数据
  async loadInitialData() {
    this.setData({ loading: true })
    
    try {
      // 并行加载儿童列表、模板数据和包组数据
      const [childrenResult, taskResult, rewardResult, packageGroupsResult] = await Promise.all([
        childrenApi.getList(),
        templatesApi.getTaskTemplates(),
        templatesApi.getRewardTemplates(),
        templatesApi.getPackageGroups().catch(err => {
          console.error('获取包组数据失败:', err)
          return { code: -1, msg: '获取包组数据失败', error: err }
        })
      ])

      if (childrenResult.code === 0) {
        this.setData({ children: childrenResult.data || [] })
      }

      if (taskResult.code === 0) {
        this.setData({ taskTemplates: taskResult.data || [] })
      }

      if (rewardResult.code === 0) {
        this.setData({ rewardTemplates: rewardResult.data || [] })
      }

      if (packageGroupsResult.code === 0) {
        console.log('包组数据获取成功:', packageGroupsResult.data)
        const packageGroups = packageGroupsResult.data || []
        this.setData({ packageGroups }, () => {
          console.log('设置后的包组数据:', this.data.packageGroups)
          console.log('包组数量:', packageGroups.length)
        })
      } else {
        console.error('包组数据获取失败:', packageGroupsResult)
        // 即使包组数据获取失败，也设置为空数组，不影响页面显示
        this.setData({ packageGroups: [] })
      }

    } catch (error) {
      console.error('加载数据失败:', error)
      console.error('详细错误信息:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      })
      wx.showToast({
        title: '加载数据失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载模板数据
  async loadTemplates() {
    this.setData({ loading: true })
    
    try {
      const filters = {}
      if (this.data.ageFilter) {
        filters.ageGroup = this.data.ageFilter
      }
      if (this.data.categoryFilter) {
        filters.category = this.data.categoryFilter
      }

      const [taskResult, rewardResult] = await Promise.all([
        templatesApi.getTaskTemplates(filters),
        templatesApi.getRewardTemplates(filters)
      ])

      if (taskResult.code === 0) {
        this.setData({ taskTemplates: taskResult.data || [] })
      }

      if (rewardResult.code === 0) {
        this.setData({ rewardTemplates: rewardResult.data || [] })
      }

    } catch (error) {
      console.error('加载模板失败:', error)
      wx.showToast({
        title: '加载模板失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 切换标签页
  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  // 选择年龄段筛选
  onAgeFilterChange: function(e) {
    const selectedIndex = e.detail.value
    const ageFilter = selectedIndex >= 0 ? this.data.ageGroups[selectedIndex].value : ''
    this.setData({ 
      ageFilter,
      ageFilterIndex: selectedIndex
    }, () => {
      this.loadTemplates()
    })
  },

  // 选择分类筛选
  onCategoryFilterChange: function(e) {
    const selectedIndex = e.detail.value
    const categoryFilter = selectedIndex >= 0 ? this.data.categories[selectedIndex].value : ''
    this.setData({ 
      categoryFilter,
      categoryFilterIndex: selectedIndex
    }, () => {
      this.loadTemplates()
    })
  },

  // 清除筛选
  clearFilters: function() {
    this.setData({
      ageFilter: '',
      categoryFilter: '',
      ageFilterIndex: -1,
      categoryFilterIndex: -1,
      selectedPackageGroup: ''
    }, () => {
      this.loadTemplates()
    })
  },

  // 切换包组显示
  togglePackageGroups: function(e) {
    const mode = e.currentTarget.dataset.mode
    const newShowPackageGroups = mode === 'package'
    
    this.setData({
      showPackageGroups: newShowPackageGroups,
      selectedPackageGroup: '' // 清除包组选择
    })
  },

  // 选择包组
  onPackageGroupSelect: function(e) {
    const packageGroup = e.currentTarget.dataset.packageGroup
    this.setData({
      selectedPackageGroup: packageGroup
    }, () => {
      this.loadTemplates()
    })
  },

  // 应用包组到儿童
  applyPackageGroupToChildren: function(e) {
    const packageGroup = e.currentTarget.dataset.packageGroup
    const templateType = this.data.activeTab // 'task' 或 'reward'
    
    // 找到对应的包组信息
    const packageData = this.data.packageGroups.find(group => group.packageGroup === packageGroup)
    
    console.log('应用包组到儿童:', { packageGroup, templateType, packageData })
    
    // 根据当前标签页确定具体的应用类型
    let applyType, count, description
    if (templateType === 'task') {
      applyType = 'task'
      count = packageData?.taskCount || 0
      description = `包含${count}个任务的模板包组`
      console.log('准备应用任务包组:', { applyType, count, packageGroup })
    } else {
      applyType = 'reward'
      count = packageData?.rewardCount || 0
      description = `包含${count}个奖励的模板包组`
      console.log('准备应用奖励包组:', { applyType, count, packageGroup })
    }
    
    this.setData({ 
      showChildSelector: true,
      currentTemplate: { 
        packageGroup, 
        templateType: applyType, // 传递单一类型，而不是数组
        packageName: packageData?.packageName || packageGroup,
        taskCount: packageData?.taskCount || 0,
        rewardCount: packageData?.rewardCount || 0,
        applyCount: count, // 添加应用数量字段
        description: description
      },
      selectedChildren: [] 
    })
  },

  // 显示儿童选择器
  showChildSelectorModal: function(e) {
    const template = e.currentTarget.dataset.template
    console.log('显示儿童选择器，模板信息:', template)
    this.setData({ 
      showChildSelector: true,
      currentTemplate: template,
      selectedChildren: [] // 重置选择
    })
  },

  // 关闭儿童选择器
  hideChildSelectorModal: function() {
    this.setData({ 
      showChildSelector: false,
      currentTemplate: null,
      selectedChildren: []
    })
  },

  // 处理 checkbox-group 变化事件
  onCheckboxChange: function(e) {
    const selectedChildren = e.detail.value
    console.log('checkbox 变化事件，选中的儿童:', selectedChildren)
    this.setData({ selectedChildren })
  },



  // 全选/取消全选
  onToggleSelectAll: function() {
    const children = this.data.children
    const selectedChildren = this.data.selectedChildren
    
    if (selectedChildren.length === children.length) {
      // 取消全选
      this.setData({ selectedChildren: [] })
    } else {
      // 全选
      this.setData({ 
        selectedChildren: children.map(child => child._id)
      })
    }
  },

  // 应用模板到选中的儿童
  async applyTemplateToChildren() {
    const { currentTemplate, selectedChildren } = this.data
    
    if (!currentTemplate) return
    
    if (selectedChildren.length === 0) {
      wx.showToast({
        title: '请选择至少一个儿童',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })
    
    try {
      let result
      
      // 判断是包组应用还是单个模板应用
      if (currentTemplate.packageGroup) {
        // 包组应用
        console.log('开始应用包组:', {
          packageGroup: currentTemplate.packageGroup,
          selectedChildren: selectedChildren,
          templateType: currentTemplate.templateType,
          fullTemplate: currentTemplate
        })
        
        result = await templatesApi.applyPackageGroup(
          currentTemplate.packageGroup,
          selectedChildren,
          currentTemplate.templateType
        )
        
        console.log('包组应用API返回:', result)
      } else {
        // 单个模板应用
        const templateType = this.data.activeTab
        if (templateType === 'task') {
          result = await templatesApi.applyTaskTemplate(
            currentTemplate._id,
            selectedChildren
          )
        } else {
          result = await templatesApi.applyRewardTemplate(
            currentTemplate._id,
            selectedChildren
          )
        }
      }

      if (result.code === 0) {
        const successCount = result.data.successResults.length
        const errorCount = result.data.errorResults.length
        
        wx.showToast({
          title: `应用完成，成功: ${successCount}，失败: ${errorCount}`,
          icon: errorCount === 0 ? 'success' : 'none'
        })
        
        // 记录应用历史到业务数据管理器
        if (businessDataManager) {
          try {
            if (currentTemplate.packageGroup) {
              businessDataManager.set(`package_${currentTemplate.packageGroup}_applied`, {
                packageGroup: currentTemplate.packageGroup,
                templateType: currentTemplate.templateType,
                childIds: selectedChildren,
                applyTime: new Date().toISOString(),
                successCount,
                errorCount
              })
            } else {
              businessDataManager.set(`template_${currentTemplate.templateId}_applied`, {
                templateId: currentTemplate.templateId,
                templateName: currentTemplate.name,
                templateType: this.data.activeTab,
                childIds: selectedChildren,
                applyTime: new Date().toISOString(),
                successCount,
                errorCount
              })
            }
          } catch (cacheError) {
            console.warn('记录应用历史失败:', cacheError)
            // 不影响主要功能，只记录警告
          }
        } else {
          console.warn('业务数据管理器不可用，跳过记录应用历史')
        }
        
        this.hideChildSelectorModal()
      } else {
        console.error('应用模板失败，服务器返回:', result)
        wx.showToast({
          title: result.msg || '应用失败',
          icon: 'error',
          duration: 3000
        })
        
        // 显示详细错误信息到控制台
        if (result.msg && result.msg.includes('包组')) {
          console.error('包组应用详细错误:', {
            packageGroup: currentTemplate.packageGroup,
            templateType: currentTemplate.templateType,
            selectedChildren: selectedChildren,
            serverMsg: result.msg
          })
        }
      }

    } catch (error) {
      console.error('应用模板失败，异常错误:', error)
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        currentTemplate: currentTemplate,
        selectedChildren: selectedChildren
      })
      wx.showToast({
        title: error.message?.includes('包组') ? '应用包组失败' : '应用失败',
        icon: 'error',
        duration: 3000
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 查看模板详情
  onViewTemplate: function(e) {
    const template = e.currentTarget.dataset.template
    const templateType = this.data.activeTab
    
    wx.showModal({
      title: '模板详情',
      content: `名称：${template.name}\n描述：${template.description || '无'}\n积分：${template.points || template.pointsRequired || '无'}\n年龄段：${this.getAgeGroupLabel(template.ageGroup)}\n分类：${this.getCategoryLabel(template.category)}`,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 获取年龄段标签
  getAgeGroupLabel: function(ageGroup) {
    const ageGroupMap = {
      'grade1': '一年级(6-8岁)',
      'grade2': '二年级(7-9岁)',
      'grade3': '三年级(8-10岁)',
      'grade4': '四年级(9-11岁)',
      'grade5': '五年级(10-12岁)',
      'grade6': '六年级(11-13岁)'
    }
    return ageGroupMap[ageGroup] || ageGroup
  },

  // 获取分类标签
  getCategoryLabel: function(category) {
    const categoryMap = {
      'study': '学习',
      'life': '生活',
      'exercise': '运动',
      'social': '社交',
      'family': '家庭',
      'entertainment': '娱乐',
      'study_supplies': '学习用品'
    }
    return categoryMap[category] || category
  },

  // 创建新模板
  onCreateTemplate: function() {
    const templateType = this.data.activeTab
    wx.navigateTo({
      url: `/pages/template-editor/template-editor?type=${templateType}`
    })
  },

  // 编辑模板
  onEditTemplate: function(e) {
    const template = e.currentTarget.dataset.template
    const templateType = this.data.activeTab
    wx.navigateTo({
      url: `/pages/template-editor/template-editor?type=${templateType}&id=${template._id}`
    })
  },

  // 删除模板
  onDeleteTemplate: function(e) {
    const template = e.currentTarget.dataset.template
    const templateType = this.data.activeTab
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除模板"${template.name}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true })
          
          try {
            let result
            if (templateType === 'task') {
              result = await templatesApi.deleteTaskTemplate(template._id)
            } else {
              result = await templatesApi.deleteRewardTemplate(template._id)
            }

            if (result.code === 0) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.loadTemplates()
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
  },

  // 切换模板状态
  onToggleTemplateStatus: function(e) {
    const template = e.currentTarget.dataset.template
    const newStatus = !template.isActive
    
    wx.showModal({
      title: newStatus ? '启用模板' : '禁用模板',
      content: `确定要${newStatus ? '启用' : '禁用'}模板"${template.name}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          this.setData({ loading: true })
          
          try {
            const result = await templatesApi.toggleTemplateStatus(template._id, newStatus)

            if (result.code === 0) {
              wx.showToast({
                title: newStatus ? '启用成功' : '禁用成功',
                icon: 'success'
              })
              this.loadTemplates()
            } else {
              wx.showToast({
                title: result.msg || '操作失败',
                icon: 'error'
              })
            }

          } catch (error) {
            console.error('切换模板状态失败:', error)
            wx.showToast({
              title: '操作失败',
              icon: 'error'
            })
          } finally {
            this.setData({ loading: false })
          }
        }
      }
    })
  },

  // 获取已选择儿童的名称列表
  getSelectedChildrenNames: function() {
    const selectedChildren = this.data.selectedChildren
    const children = this.data.children
    return selectedChildren.map(childId => {
      const child = children.find(c => c._id === childId)
      return child ? child.name : '未知儿童'
    })
  },

  // 跳转到添加儿童页面
  goToAddChild: function() {
    wx.navigateTo({
      url: '/pages/child-management/child-management'
    })
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadTemplates().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
})