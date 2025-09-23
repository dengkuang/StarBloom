// 全局孩子状态管理器 - 专注于全局状态管理和事件通知
const businessDataManager = require('./businessDataManager.js');

/**
 * 全局孩子状态管理器
 */
class GlobalChildManager {
  constructor() {
    this.dataManager = businessDataManager;
    this.initialized = false;
  }

  /**
   * 初始化孩子状态
   */
  initChildState(childrenList) {
    if (!childrenList || childrenList.length === 0) {
      this.dataManager.setCurrentChild(null);
      this.dataManager.setCurrentChildIndex(0);
      this.dataManager.setChildrenList([]);
      return { currentChild: null, currentChildIndex: 0, childrenList: [] };
    }

    let currentChildIndex = this.dataManager.getCurrentChildIndex();
    let currentChild = this.dataManager.getCurrentChild();

    // 验证当前孩子是否还在列表中
    if (currentChild) {
      const foundIndex = childrenList.findIndex(child => child._id === currentChild._id);
      if (foundIndex !== -1) {
        currentChildIndex = foundIndex;
      } else {
        // 当前孩子不在列表中，重置为第一个
        currentChildIndex = 0;
        currentChild = childrenList[0];
      }
    } else {
      // 没有当前孩子，选择第一个
      currentChildIndex = 0;
      currentChild = childrenList[0];
    }

    // 确保索引有效
    if (currentChildIndex >= childrenList.length) {
      currentChildIndex = 0;
      currentChild = childrenList[0];
    }

    this.dataManager.setCurrentChild(currentChild);
    this.dataManager.setCurrentChildIndex(currentChildIndex);
    this.dataManager.setChildrenList(childrenList);

    this.initialized = true;
    return { currentChild, currentChildIndex, childrenList };
  }

  /**
   * 切换孩子
   */
  switchChild(childrenList, index) {
    if (!childrenList || index < 0 || index >= childrenList.length) {
      console.error('切换孩子参数无效:', { childrenList, index });
      return false;
    }

    const selectedChild = childrenList[index];
    
    // 更新数据
    this.dataManager.setCurrentChild(selectedChild);
    this.dataManager.setCurrentChildIndex(index);
    this.dataManager.setChildrenList(childrenList);

    // 通知页面更新
    this.notifyChildChanged(selectedChild, index);
    
    return true;
  }

  /**
   * 通知孩子切换事件
   */
  notifyChildChanged(child, index) {
    // 使用小程序的事件总线机制
    const pages = getCurrentPages();
    pages.forEach(page => {
      if (page.onChildChanged && typeof page.onChildChanged === 'function') {
        try {
          page.onChildChanged(child, index);
        } catch (error) {
          console.error('页面孩子切换回调执行失败:', error);
        }
      }
    });

    // 触发数据管理器的事件
    this.dataManager.emit('child:switched', { child, index });
  }

  /**
   * 获取当前孩子状态
   */
  getCurrentState() {
    return {
      currentChild: this.dataManager.getCurrentChild(),
      currentChildIndex: this.dataManager.getCurrentChildIndex(),
      childrenList: this.dataManager.getChildrenList() || []
    };
  }

  /**
   * 监听孩子状态变化
   */
  onChildStateChange(callback) {
    this.dataManager.on('child:switched', callback);
  }

  /**
   * 移除孩子状态变化监听
   */
  offChildStateChange(callback) {
    this.dataManager.off('child:switched', callback);
  }

  /**
   * 更新当前孩子信息（保持索引不变）
   */
  updateCurrentChild(updatedChild) {
    const currentState = this.getCurrentState();
    
    if (currentState.currentChild && currentState.currentChild._id === updatedChild._id) {
      // 更新当前孩子数据
      this.dataManager.setCurrentChild(updatedChild);
      
      // 更新孩子列表中的对应项
      const updatedChildrenList = [...currentState.childrenList];
      updatedChildrenList[currentState.currentChildIndex] = updatedChild;
      this.dataManager.setChildrenList(updatedChildrenList);
      
      // 通知页面更新
      this.notifyChildChanged(updatedChild, currentState.currentChildIndex);
      
      console.log('✅ [全局状态] 孩子信息已更新:', updatedChild.name, '积分:', updatedChild.totalPoints);
      return true;
    }
    
    return false;
  }

  /**
   * 清除孩子状态
   */
  clearChildState() {
    this.dataManager.clearChildCache();
    this.initialized = false;
    this.notifyChildChanged(null, 0);
  }
}

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
   */
  initGlobalChildState: function() {
    const state = globalChildManager.getCurrentState();
    
    this.setData({
      globalChildrenList: state.childrenList,
      globalCurrentChild: state.currentChild,
      globalCurrentChildIndex: state.currentChildIndex
    });

    return state;
  },

  /**
   * 同步全局孩子状态
   */
  syncGlobalChildState: function() {
    const state = globalChildManager.getCurrentState();

    // 检查是否需要更新
    const needUpdate = !this.data.globalCurrentChild || 
                      this.data.globalCurrentChild._id !== state.currentChild?._id ||
                      this.data.globalCurrentChildIndex !== state.currentChildIndex;

    if (needUpdate) {
      this.setData({
        globalChildrenList: state.childrenList,
        globalCurrentChild: state.currentChild,
        globalCurrentChildIndex: state.currentChildIndex
      });

      // 如果页面有自定义的同步回调，则调用
      if (this.onGlobalChildStateChanged && typeof this.onGlobalChildStateChanged === 'function') {
        this.onGlobalChildStateChanged(state.currentChild, state.currentChildIndex);
      }
    }

    return state;
  },

  /**
   * 全局切换孩子
   */
  switchGlobalChild: function(childrenList, index) {
    const success = globalChildManager.switchChild(childrenList, index);
    
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
    return this.data.globalCurrentChild || globalChildManager.getCurrentState().currentChild;
  },

  /**
   * 获取当前孩子索引
   */
  getCurrentChildIndex: function() {
    return this.data.globalCurrentChildIndex !== undefined ? 
           this.data.globalCurrentChildIndex : 
           globalChildManager.getCurrentState().currentChildIndex;
  },

  /**
   * 获取孩子列表
   */
  getChildrenList: function() {
    return this.data.globalChildrenList.length > 0 ? 
           this.data.globalChildrenList : 
           globalChildManager.getCurrentState().childrenList;
  },

  /**
   * 设置全局孩子列表
   */
  setGlobalChildrenList: function(childrenList) {
    const state = globalChildManager.initChildState(childrenList);
    
    this.setData({
      globalChildrenList: state.childrenList,
      globalCurrentChild: state.currentChild,
      globalCurrentChildIndex: state.currentChildIndex
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

// 创建全局实例
const globalChildManager = new GlobalChildManager();

module.exports = {
  GlobalChildManager,
  GlobalChildManagerMixin,
  withGlobalChildManager,
  globalChildManager
};