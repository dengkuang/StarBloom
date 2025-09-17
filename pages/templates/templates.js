// 预设模板页面逻辑
const { templatesApi } = require('../../utils/api-services.js');

Page({
  data: {
    loading: false,
    
    // 标签页状态
    activeTab: 'task', // task, reward, package
    
    // 筛选状态
    ageFilter: '', // '', '3-6', '6-9', '9-12'
    
    // 模板数据
    taskTemplates: [],
    rewardTemplates: [],
    packageGroups: [],
    
    // 筛选后的数据
    filteredTaskTemplates: [],
    filteredRewardTemplates: [],
    
    // 统计数据
    taskTemplateCount: 0,
    rewardTemplateCount: 0,
    packageCount: 0,
    
    // 预览弹窗
    showPreviewModal: false,
    previewTemplate: null
  },

  onLoad: function () {
    this.loadTemplateData();
  },

  onShow: function () {
    // 页面显示时刷新数据
    this.loadTemplateData();
  },

  onPullDownRefresh: function () {
    this.loadTemplateData().then(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '刷新成功', icon: 'success' });
    }).catch(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '刷新失败', icon: 'none' });
    });
  },

  onReachBottom: function () {
    // 可以在这里实现分页加载
  },

  // 加载模板数据
  loadTemplateData: async function() {
    this.setData({ loading: true });
    
    try {
      // 并行加载所有数据
      const [taskResult, rewardResult, packageResult] = await Promise.all([
        this.loadTaskTemplates(),
        this.loadRewardTemplates(),
        this.loadPackageGroups()
      ]);

      // 更新统计数据
      this.setData({
        taskTemplateCount: this.data.taskTemplates.length,
        rewardTemplateCount: this.data.rewardTemplates.length,
        packageCount: this.data.packageGroups.length
      });

      // 应用筛选
      this.applyFilters();
      
    } catch (error) {
      console.error('加载模板数据失败:', error);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载任务模板
  loadTaskTemplates: async function() {
    try {
      // 从本地JSON文件加载预设模板
      const templates = await this.loadTemplatesFromFile('task');
      this.setData({ taskTemplates: templates });
      return templates;
    } catch (error) {
      console.error('加载任务模板失败:', error);
      return [];
    }
  },

  // 加载奖励模板
  loadRewardTemplates: async function() {
    try {
      // 从本地JSON文件加载预设模板
      const templates = await this.loadTemplatesFromFile('reward');
      this.setData({ rewardTemplates: templates });
      return templates;
    } catch (error) {
      console.error('加载奖励模板失败:', error);
      return [];
    }
  },

  // 加载模板包组
  loadPackageGroups: async function() {
    try {
      // 模拟包组数据，实际项目中可以从API获取
      const packages = [
        {
          packageGroup: 'daily_routine_3_6',
          packageName: '3-6岁日常习惯',
          description: '适合3-6岁儿童的日常习惯培养模板包',
          taskCount: 8,
          rewardCount: 6
        },
        {
          packageGroup: 'learning_skills_6_9',
          packageName: '6-9岁学习技能',
          description: '培养6-9岁儿童学习习惯和技能的模板包',
          taskCount: 10,
          rewardCount: 8
        },
        {
          packageGroup: 'responsibility_9_12',
          packageName: '9-12岁责任感培养',
          description: '培养9-12岁儿童责任感和独立性的模板包',
          taskCount: 12,
          rewardCount: 10
        }
      ];
      
      this.setData({ packageGroups: packages });
      return packages;
    } catch (error) {
      console.error('加载模板包组失败:', error);
      return [];
    }
  },

  // 从文件加载模板数据
  loadTemplatesFromFile: function(type) {
    return new Promise((resolve, reject) => {
      // 模拟从templates目录加载数据
      const mockData = this.getMockTemplateData(type);
      setTimeout(() => resolve(mockData), 300); // 模拟网络延迟
    });
  },

  // 获取模拟模板数据
  getMockTemplateData: function(type) {
    if (type === 'task') {
      return [
        {
          id: 'task_1',
          name: '整理房间',
          description: '每天整理自己的房间，保持整洁',
          category: '日常习惯',
          points: 10,
          ageGroup: '3-6',
          difficulty: 'easy'
        },
        {
          id: 'task_2',
          name: '完成作业',
          description: '按时完成学校布置的作业',
          category: '学习任务',
          points: 20,
          ageGroup: '6-9',
          difficulty: 'medium'
        },
        {
          id: 'task_3',
          name: '帮助做家务',
          description: '主动帮助家长做力所能及的家务',
          category: '家庭责任',
          points: 15,
          ageGroup: '9-12',
          difficulty: 'medium'
        },
        {
          id: 'task_4',
          name: '阅读30分钟',
          description: '每天坚持阅读30分钟课外书',
          category: '学习习惯',
          points: 15,
          ageGroup: '6-9',
          difficulty: 'easy'
        },
        {
          id: 'task_5',
          name: '练习乐器',
          description: '每天练习乐器30分钟',
          category: '兴趣爱好',
          points: 25,
          ageGroup: '9-12',
          difficulty: 'hard'
        }
      ];
    } else if (type === 'reward') {
      return [
        {
          id: 'reward_1',
          name: '看动画片',
          description: '可以看30分钟喜欢的动画片',
          category: '娱乐奖励',
          pointsRequired: 20,
          ageGroup: '3-6',
          type: 'entertainment'
        },
        {
          id: 'reward_2',
          name: '买新玩具',
          description: '可以选择一个心仪的小玩具',
          category: '物质奖励',
          pointsRequired: 100,
          ageGroup: '3-6',
          type: 'material'
        },
        {
          id: 'reward_3',
          name: '外出游玩',
          description: '周末可以去公园或游乐场玩',
          category: '体验奖励',
          pointsRequired: 150,
          ageGroup: '6-9',
          type: 'experience'
        },
        {
          id: 'reward_4',
          name: '零花钱',
          description: '获得10元零花钱',
          category: '物质奖励',
          pointsRequired: 80,
          ageGroup: '9-12',
          type: 'material'
        },
        {
          id: 'reward_5',
          name: '朋友聚会',
          description: '可以邀请朋友来家里玩',
          category: '社交奖励',
          pointsRequired: 120,
          ageGroup: '9-12',
          type: 'social'
        }
      ];
    }
    return [];
  },

  // 标签页切换
  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 年龄筛选
  onAgeFilterChange: function(e) {
    const age = e.currentTarget.dataset.age;
    this.setData({ ageFilter: age });
    this.applyFilters();
  },

  // 应用筛选
  applyFilters: function() {
    const { taskTemplates, rewardTemplates, ageFilter } = this.data;
    
    let filteredTasks = taskTemplates;
    let filteredRewards = rewardTemplates;
    
    if (ageFilter) {
      filteredTasks = taskTemplates.filter(item => item.ageGroup === ageFilter);
      filteredRewards = rewardTemplates.filter(item => item.ageGroup === ageFilter);
    }
    
    this.setData({
      filteredTaskTemplates: filteredTasks,
      filteredRewardTemplates: filteredRewards
    });
  },

  // 预览模板
  onPreviewTemplate: function(e) {
    const template = e.currentTarget.dataset.template;
    const index = e.currentTarget.dataset.index;
    
    this.setData({
      showPreviewModal: true,
      previewTemplate: {
        ...template,
        type: this.data.activeTab
      }
    });
  },

  // 关闭预览弹窗
  hidePreviewModal: function() {
    this.setData({
      showPreviewModal: false,
      previewTemplate: null
    });
  },

  // 应用模板
  onApplyTemplate: function(e) {
    const template = e.currentTarget.dataset.template;
    const type = e.currentTarget.dataset.type;
    
    wx.showModal({
      title: '应用模板',
      content: `确定要应用"${template.name}"模板吗？`,
      success: (res) => {
        if (res.confirm) {
          this.applyTemplateToSystem(template, type);
        }
      }
    });
  },

  // 从预览弹窗应用模板
  onApplyFromPreview: function() {
    const template = this.data.previewTemplate;
    if (template) {
      this.hidePreviewModal();
      this.applyTemplateToSystem(template, template.type);
    }
  },

  // 应用模板到系统
  applyTemplateToSystem: async function(template, type) {
    wx.showLoading({ title: '应用中...' });
    
    try {
      // 这里应该调用API将模板应用到系统
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      wx.hideLoading();
      wx.showToast({
        title: '应用成功',
        icon: 'success'
      });
      
      // 可以跳转到相应的管理页面
      if (type === 'task') {
        // wx.navigateTo({ url: '/pages/tasks/tasks' });
      } else if (type === 'reward') {
        // wx.navigateTo({ url: '/pages/rewards/rewards' });
      }
      
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '应用失败',
        icon: 'none'
      });
      console.error('应用模板失败:', error);
    }
  },

  // 预览模板包
  onPreviewPackage: function(e) {
    const packageData = e.currentTarget.dataset.package;
    
    wx.showModal({
      title: packageData.packageName,
      content: `${packageData.description}\n\n包含：\n• ${packageData.taskCount}个任务模板\n• ${packageData.rewardCount}个奖励模板`,
      showCancel: false
    });
  },

  // 应用模板包
  onApplyPackage: function(e) {
    const packageData = e.currentTarget.dataset.package;
    
    wx.showModal({
      title: '应用模板包',
      content: `确定要应用"${packageData.packageName}"模板包吗？这将添加${packageData.taskCount}个任务模板和${packageData.rewardCount}个奖励模板。`,
      success: (res) => {
        if (res.confirm) {
          this.applyPackageToSystem(packageData);
        }
      }
    });
  },

  // 应用模板包到系统
  applyPackageToSystem: async function(packageData) {
    wx.showLoading({ title: '应用中...' });
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      wx.hideLoading();
      wx.showToast({
        title: '模板包应用成功',
        icon: 'success'
      });
      
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '应用失败',
        icon: 'none'
      });
      console.error('应用模板包失败:', error);
    }
  },

  // 导航到模板管理
  navigateToManagement: function() {
    wx.navigateTo({
      url: '/pages/template-management/template-management'
    });
  },

  // 导航到模板编辑器
  navigateToEditor: function() {
    wx.navigateTo({
      url: '/pages/template-editor/template-editor'
    });
  },

  // 显示导入弹窗
  showImportModal: function() {
    wx.navigateTo({
      url: '/pages/template-import/template-import'
    });
  },

  // 显示导出弹窗
  showExportModal: function() {
    wx.showModal({
      title: '导出模板',
      content: '此功能正在开发中，敬请期待！',
      showCancel: false
    });
  },

  // 获取年龄组文本
  getAgeGroupText: function(ageGroup) {
    const ageMap = {
      '3-6': '3-6岁',
      '6-9': '6-9岁',
      '9-12': '9-12岁'
    };
    return ageMap[ageGroup] || '全年龄';
  },

  // 获取难度文本
  getDifficultyText: function(difficulty) {
    const difficultyMap = {
      'easy': '简单',
      'medium': '中等',
      'hard': '困难'
    };
    return difficultyMap[difficulty] || '普通';
  },

  // 获取奖励类型文本
  getRewardTypeText: function(type) {
    const typeMap = {
      'entertainment': '娱乐',
      'material': '物质',
      'experience': '体验',
      'social': '社交'
    };
    return typeMap[type] || '其他';
  }
});