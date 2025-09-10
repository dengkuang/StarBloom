// 数据管理器
// 遵循用户偏好的统一数据管理模块偏好
const businessDataManager = {
  // 用户信息管理
  setUserInfo(userInfo) {
    wx.setStorageSync('userInfo', userInfo);
  },

  getUserInfo() {
    return wx.getStorageSync('userInfo');
  },

  // 儿童信息管理
  setCurrentChild(child) {
    wx.setStorageSync('currentChild', child);
  },

  getCurrentChild() {
    return wx.getStorageSync('currentChild');
  },

  setChildrenList(children) {
    wx.setStorageSync('childrenList', children);
  },

  getChildrenList() {
    return wx.getStorageSync('childrenList');
  },

  // 设置信息管理
  setSettings(settings) {
    const currentSettings = wx.getStorageSync('appSettings') || {};
    wx.setStorageSync('appSettings', { ...currentSettings, ...settings });
  },

  getSettings() {
    return wx.getStorageSync('appSettings') || {};
  },

  // 从全局数据同步
  syncFromGlobalData() {
    // 实现从全局数据同步的逻辑
  },

  // 清理所有数据
  clearAll() {
    wx.clearStorageSync();
  }
};

module.exports = {
  businessDataManager
};