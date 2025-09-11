// 家长管理页面逻辑
const cloudInitializer = require('../../utils/cloud-init.js');

Page({
  data: {
    initStatus: '点击按钮初始化云数据库'
  },

  onLoad: function () {
    // 初始化云环境
    cloudInitializer.init().catch(err => {
      console.error('云环境初始化失败:', err);
      this.setData({
        initStatus: '云环境初始化失败: ' + err.message
      });
    });
  },

  /**
   * 初始化云数据库
   */
  initCloudDatabase: function () {
    wx.showLoading({
      title: '初始化中...'
    });

    this.setData({
      initStatus: '正在初始化云数据库...'
    });

    // 调用第一个云函数：初始化数据库
    cloudInitializer.callFunction({
      name: 'initDatabase',
      data: {
        action: 'init'
      }
    }).then(res => {
      console.log('initDatabase result:', res);
      if (res.result && res.result.code === 0) {
        // 第一个云函数成功后，调用第二个云函数：初始化默认奖励
        return cloudInitializer.callFunction({
          name: 'initDefaultRewards',
          data: {
            action: 'init'
          }
        });
      } else {
        throw new Error(res.result ? res.result.message : '初始化数据库失败');
      }
    }).then(res => {
      console.log('initDefaultRewards result:', res);
      wx.hideLoading();
      
      if (res.result && res.result.code === 0) {
        this.setData({
          initStatus: '云数据库初始化成功！'
        });
        wx.showToast({
          title: '初始化成功',
          icon: 'success'
        });
      } else {
        throw new Error(res.result ? res.result.message : '初始化默认奖励失败');
      }
    }).catch(err => {
      console.error('初始化云数据库失败:', err);
      wx.hideLoading();
      this.setData({
        initStatus: '初始化失败: ' + err.message
      });
      wx.showToast({
        title: '初始化失败',
        icon: 'none'
      });
    });
  }
})