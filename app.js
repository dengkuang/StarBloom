// 应用入口文件
App({
  globalData: {
    userInfo: null,
    currentChild: null,
    childrenList: []
  },

  onLaunch: function () {
    // 小程序初始化时执行
    console.log('StarBloom app launched');
    
    // 初始化云环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        env: 'cloud1-2ghnni8r13cb9f60', // 开发环境ID
        traceUser: true,
      });
      wx.cloud.callFunction({
        name: 'manageIndexes',
        data: {
        action: 'createAllIndexes'
        }
      })
      console.log('云环境初始化成功');
    }
  },

  onShow: function () {
    // 小程序启动，或从后台进入前台显示时执行
    console.log('StarBloom app shown');
  },

  onHide: function () {
    // 小程序从前台进入后台时执行
    console.log('StarBloom app hidden');
  }
});