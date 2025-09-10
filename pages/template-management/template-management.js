// pages/template-management/template-management.js
// 模板管理页面逻辑
Page({
  data: {
    activeTab: 'task',
    taskTemplates: [],
    rewardTemplates: []
  },

  onLoad: function () {
    this.loadTemplates();
  },

  loadTemplates: function() {
    // 加载模板数据
    this.loadTaskTemplates();
    this.loadRewardTemplates();
  },

  loadTaskTemplates: function() {
    // 加载任务模板
    const taskTemplates = [
      // 示例数据
      { id: 1, name: '每日阅读', description: '每天阅读30分钟', points: 10 },
      { id: 2, name: '整理房间', description: '整理自己的房间', points: 15 }
    ];
    this.setData({ taskTemplates });
  },

  loadRewardTemplates: function() {
    // 加载奖励模板
    const rewardTemplates = [
      // 示例数据
      { id: 1, name: '小贴纸', description: '可爱的卡通贴纸', points: 10 },
      { id: 2, name: '额外游戏时间', description: '延长30分钟游戏时间', points: 20 }
    ];
    this.setData({ rewardTemplates });
  },

  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  onAddTemplate: function() {
    // 添加模板
    wx.navigateTo({
      url: '/pages/templates/templates'
    });
  },

  onEditTemplate: function(e) {
    const template = e.currentTarget.dataset.template;
    // 编辑模板
  },

  onDeleteTemplate: function(e) {
    const template = e.currentTarget.dataset.template;
    // 删除模板
  }
});