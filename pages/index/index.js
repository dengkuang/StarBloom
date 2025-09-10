// pages/index/index.js
// 首页页面逻辑
Page({
  data: {
    userInfo: null,
    childrenList: []
  },

  onLoad: function () {
    this.loadUserInfo();
    this.loadChildrenList();
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
  }
});