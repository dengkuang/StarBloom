// pages/index/index.js
// 新版首页页面逻辑
Page({
  data: {
    userInfo: null,
    childrenList: [],
    stats: {
      totalPoints: 0,
      completedTasks: 0,
      activeChildren: 0
    },
    currentDate: ''
  },

  onLoad: function () {
    this.loadUserInfo();
    this.loadChildrenList();
    this.loadStats();
    this.setCurrentDate();
  },

  loadUserInfo: function() {
    // 加载用户信息
    const userInfo = {
      nickName: '家长用户',
      avatarUrl: '/images/default-avatar.png'
    };
    this.setData({ userInfo });
  },

  loadChildrenList: function() {
    // 加载儿童列表
    const childrenList = [
      { id: 1, name: '小明', age: 8, totalPoints: 150, avatar: '/images/default-avatar.png' },
      { id: 2, name: '小红', age: 6, totalPoints: 200, avatar: '/images/default-avatar.png' }
    ];
    this.setData({ childrenList });
  },

  loadStats: function() {
    // 加载统计数据
    const stats = {
      totalPoints: 350,
      completedTasks: 12,
      activeChildren: 2
    };
    this.setData({ stats });
  },

  setCurrentDate: function() {
    // 设置当前日期
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[now.getDay()];
    
    this.setData({
      currentDate: `${year}年${month}月${day}日 星期${weekday}`
    });
  },

  onChildTap: function(e) {
    const child = e.currentTarget.dataset.child;
    // 跳转到儿童页面
    wx.navigateTo({
      url: `/pages/child/child?id=${child.id}`
    });
  },

  onAddChild: function() {
    // 添加儿童
    wx.navigateTo({
      url: '/pages/parent/parent'
    });
  },

  // 新增导航方法
  navigateToTasks: function() {
    wx.switchTab({
      url: '/pages/tasks/tasks'
    });
  },

  navigateToRewards: function() {
    wx.switchTab({
      url: '/pages/rewards/rewards'
    });
  },

  navigateToChildren: function() {
    wx.navigateTo({
      url: '/pages/child/child'
    });
  },

  navigateToAnalysis: function() {
    wx.switchTab({
      url: '/pages/analysis/analysis'
    });
  }
});