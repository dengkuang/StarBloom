// 业务数据管理器
class BusinessDataManager {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
  }

  /**
   * 设置缓存数据
   */
  set(key, data, expiry = 300000) { // 默认5分钟过期
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + expiry);
  }

  /**
   * 获取缓存数据
   */
  get(key) {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  /**
   * 删除缓存数据
   */
  delete(key) {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * 设置用户信息
   */
  setUserInfo(userInfo) {
    this.set('userInfo', userInfo, 600000); // 10分钟过期
  }

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return this.get('userInfo');
  }

  /**
   * 设置儿童列表
   */
  setChildrenList(childrenList) {
    this.set('childrenList', childrenList, 300000); // 5分钟过期
  }

  /**
   * 获取儿童列表
   */
  getChildrenList() {
    return this.get('childrenList');
  }

  /**
   * 设置全局孩子列表（与setChildrenList相同，为了兼容性）
   */
  setGlobalChildrenList(childrenList) {
    this.setChildrenList(childrenList);
    
    // 如果列表不为空，初始化当前孩子状态
    if (childrenList && childrenList.length > 0) {
      let currentChild = this.getCurrentChild();
      let currentChildIndex = this.getCurrentChildIndex();
      
      // 如果当前孩子不在新列表中，重置为第一个
      if (!currentChild || !childrenList.find(child => child._id === currentChild._id)) {
        currentChild = childrenList[0];
        currentChildIndex = 0;
        this.setCurrentChild(currentChild);
        this.setCurrentChildIndex(currentChildIndex);
      }
    } else {
      // 如果列表为空，清除当前孩子状态
      this.setCurrentChild(null);
      this.setCurrentChildIndex(0);
    }
  }

  /**
   * 设置当前选中的儿童
   */
  setCurrentChild(child) {
    this.set('currentChild', child, 3600000); // 1小时过期
    // 同时保存到本地存储，确保跨页面一致性
    wx.setStorageSync('currentChild', child);
  }

  /**
   * 获取当前选中的儿童
   */
  getCurrentChild() {
    // 优先从缓存获取，如果没有则从本地存储获取
    let currentChild = this.get('currentChild');
    if (!currentChild) {
      try {
        currentChild = wx.getStorageSync('currentChild');
        if (currentChild) {
          this.set('currentChild', currentChild, 3600000);
        }
      } catch (error) {
        console.error('获取本地存储的当前孩子失败:', error);
      }
    }
    return currentChild;
  }

  /**
   * 设置当前孩子索引
   */
  setCurrentChildIndex(index) {
    this.set('currentChildIndex', index, 3600000);
    wx.setStorageSync('currentChildIndex', index);
  }

  /**
   * 获取当前孩子索引
   */
  getCurrentChildIndex() {
    let index = this.get('currentChildIndex');
    if (index === null || index === undefined) {
      try {
        index = wx.getStorageSync('currentChildIndex');
        if (index !== null && index !== undefined) {
          this.set('currentChildIndex', index, 3600000);
        } else {
          index = 0; // 默认选择第一个孩子
        }
      } catch (error) {
        console.error('获取本地存储的当前孩子索引失败:', error);
        index = 0;
      }
    }
    return index;
  }

  /**
   * 全局切换孩子
   */
  switchChild(childrenList, index) {
    if (!childrenList || index < 0 || index >= childrenList.length) {
      console.error('切换孩子参数无效');
      return false;
    }

    const selectedChild = childrenList[index];
    this.setCurrentChild(selectedChild);
    this.setCurrentChildIndex(index);
    this.setChildrenList(childrenList);

    // 触发全局事件通知其他页面
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
        page.onChildChanged(child, index);
      }
    });
  }

  /**
   * 初始化孩子状态
   */
  initChildState(childrenList) {
    if (!childrenList || childrenList.length === 0) {
      this.setCurrentChild(null);
      this.setCurrentChildIndex(0);
      return { currentChild: null, currentChildIndex: 0 };
    }

    let currentChildIndex = this.getCurrentChildIndex();
    let currentChild = this.getCurrentChild();

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

    this.setCurrentChild(currentChild);
    this.setCurrentChildIndex(currentChildIndex);
    this.setChildrenList(childrenList);

    return { currentChild, currentChildIndex };
  }

  /**
   * 清除孩子相关缓存
   */
  clearChildCache() {
    this.delete('currentChild');
    this.delete('currentChildIndex');
    this.delete('childrenList');
    wx.removeStorageSync('currentChild');
    wx.removeStorageSync('currentChildIndex');
  }

  /**
   * 设置任务列表
   */
  setTaskList(taskList) {
    this.set('taskList', taskList, 180000); // 3分钟过期
  }

  /**
   * 获取任务列表
   */
  getTaskList() {
    return this.get('taskList');
  }

  /**
   * 设置奖励列表
   */
  setRewardList(rewardList) {
    this.set('rewardList', rewardList, 180000); // 3分钟过期
  }

  /**
   * 获取奖励列表
   */
  getRewardList() {
    return this.get('rewardList');
  }

  /**
   * 设置字典数据
   */
  setDictionary(category, data) {
    this.set(`dictionary_${category}`, data, 86400000); // 24小时过期
  }

  /**
   * 获取字典数据
   */
  getDictionary(category) {
    return this.get(`dictionary_${category}`);
  }

  /**
   * 设置模板数据
   */
  setTemplates(type, data) {
    this.set(`templates_${type}`, data, 3600000); // 1小时过期
  }

  /**
   * 获取模板数据
   */
  getTemplates(type) {
    return this.get(`templates_${type}`);
  }

  /**
   * 检查缓存是否有效
   */
  hasValidCache(key) {
    const expiry = this.cacheExpiry.get(key);
    return expiry && Date.now() <= expiry;
  }

  /**
   * 获取所有缓存键
   */
  getCacheKeys() {
    return Array.from(this.cache.keys());
  }
}

// 创建单例实例
const businessDataManager = new BusinessDataManager();

module.exports = businessDataManager;