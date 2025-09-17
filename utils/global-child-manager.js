
// 全局孩子状态管理工具
const businessDataManager = require('./businessDataManager.js');

/**
 * 全局孩子状态管理混入
 * 为页面提供统一的孩子状态管理功能
 */
const GlobalChildManagerMixin = {
  data: {
    // 全局孩子状态
    globalChildrenList: [],
    globalCurrentChild: null,
    globalCurrentChildIndex: 0
  },

  /**
   * 初始化全局孩子状态
   * 在页面的 onLoad 或 onShow 中调用
   */
  initGlobalChildState: function() {
    const currentChild = businessDataManager.getCurrentChild();
    const currentChildIndex = businessDataManager.getCurrentChildIndex();
    const childrenList = businessDataManager.getChildrenList() || [];

    this.setData({
      globalChildrenList: childrenList,
      globalCurrentChild: currentChild,
      globalCurrentChildIndex: currentChildIndex
    });

    return { currentChild, currentChildIndex, childrenList };
  },

  /**
   * 同步全局孩子状态
   * 在页面的 onShow 中调用
   */
  syncGlobalChildState: function() {
    const globalCurrentChild = businessDataManager.getCurrentChild();
    const globalCurrentChildIndex = businessDataManager.getCurrentChildIndex();
    const globalChildrenList = businessDataManager.getChildrenList() || [];

    // 检查是否需要更新
    const needUpdate = !this.data.globalCurrentChild || 
                      this.data.globalCurrentChild._id !== globalCurrentChild?._id ||
                      this.data.globalCurrentChildIndex !== globalCurrentChildIndex;

    if (needUpdate && globalCurrentChild) {
      this.setData({
        globalChildrenList: globalChildrenList,
        globalCurrentChild: globalCurrentChild,
        globalCurrentChildIndex: globalCurrentChildIndex
      });

      // 如果页面有自定义的同步回调，则调用
      if (this.onGlobalChildStateChanged && typeof this.onGlobalChildStateChanged === 'function') {
        this.onGlobalChildStateChanged(globalCurrentChild, globalCurrentChildIndex);
      }
    }

    return { globalCurrentChild, globalCurrentChildIndex, globalChildrenList };
  },

  /**
   * 全局切换孩子
   */
  switchGlobalChild: function(childrenList, index) {
    const success = businessDataManager.switchChild(childrenList, index);
    
    if (success) {
      const selectedChild = childrenList[index];
      
      this.setData({
        globalChildrenList: childrenList,
        globalCurrentChild: selectedChild,
        globalCurrentChildIndex: index
      });

      // 显示切换提示
      wx.showToast({
        title: `已切换到 ${selectedChild.name}`,
        icon: 'success',
        duration: 1000
      });

      // 如果页面有自定义的切换回调，则调用
      if (this.onGlobalChildSwitched && typeof this.onGlobalChildSwitched === 'function') {
        this.onGlobalChildSwitched(selectedChild, index);
      }
    } else {
      wx.showToast({
        title: '切换失败',
        icon: 'none'
      });
    }

    return success;
  },

  /**
   * 监听全局孩子切换事件
   * 页面可以重写此方法来处理孩子切换
   */
  onChildChanged: function(child, index) {
    // 更新页面状态
    this.setData({
      globalCurrentChild: child,
      globalCurrentChildIndex: index
    });

    // 如果页面有自定义的切换回调，则调用
    if (this.onGlobalChildStateChanged && typeof this.onGlobalChildStateChanged === 'function') {
      this.onGlobalChildStateChanged(child, index);
    }
  },

  /**
   * 获取当前选中的孩子
   */
  getCurrentChild: function() {
    return this.data.globalCurrentChild || businessDataManager.getCurrentChild();
  },

  /**
   * 获取当前孩子索引
   */
  getCurrentChildIndex: function() {
    return this.data.globalCurrentChildIndex !== undefined ? 
           this.data.globalCurrentChildIndex : 
           businessDataManager.getCurrentChildIndex();
  },

  /**
   * 获取孩子列表
   */
  getChildrenList: function() {
    return this.data.globalChildrenList.length > 0 ? 
           this.data.globalChildrenList : 
           businessDataManager.getChildrenList() || [];
  },

  /**
   * 设置全局孩子列表
   */
  setGlobalChildrenList: function(childrenList) {
    businessDataManager.setGlobalChildrenList(childrenList);
    
    const currentChild = businessDataManager.getCurrentChild();
    const currentChildIndex = businessDataManager.getCurrentChildIndex();
    
    this.setData({
      globalChildrenList: childrenList || [],
      globalCurrentChild: currentChild,
      globalCurrentChildIndex: currentChildIndex
    });
  },

  /**
   * 切换孩子
   */
  switchChild: function(index) {
    const childrenList = this.getChildrenList();
    if (index >= 0 && index < childrenList.length) {
      return this.switchGlobalChild(childrenList, index);
    }
    return false;
  }
};

/**
 * 为页面添加全局孩子状态管理功能
 * @param {Object} pageOptions 页面配置对象
 * @returns {Object} 增强后的页面配置对象
 */
function withGlobalChildManager(pageOptions) {
  // 合并数据
  pageOptions.data = Object.assign({}, GlobalChildManagerMixin.data, pageOptions.data || {});

  // 合并方法
  Object.keys(GlobalChildManagerMixin).forEach(key => {
    if (key !== 'data' && typeof GlobalChildManagerMixin[key] === 'function') {
      // 如果页面已有同名方法，保留原方法并添加前缀
      if (pageOptions[key] && typeof pageOptions[key] === 'function') {
        pageOptions[`_original_${key}`] = pageOptions[key];
      }
      pageOptions[key] = GlobalChildManagerMixin[key];
    }
  });

  // 增强 onShow 方法
  const originalOnShow = pageOptions.onShow;
  pageOptions.onShow = function() {
    // 先调用原始的 onShow
    if (originalOnShow && typeof originalOnShow === 'function') {
      originalOnShow.call(this);
    }
    
    // 然后同步全局状态
    this.syncGlobalChildState();
  };

  return pageOptions;
}

module.exports = {
  GlobalChildManagerMixin,
  withGlobalChildManager,
  businessDataManager
};