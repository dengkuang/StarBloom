// 业务数据管理器 - 核心数据管理层
class BusinessDataManager {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.eventListeners = new Map(); // 事件监听器
  }

  /**
   * 设置缓存数据
   */
  set(key, data, expiry = 300000) { // 默认5分钟过期
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + expiry);
    
    // 触发数据变更事件
    this.emit(`${key}:changed`, data);
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
    this.emit(`${key}:deleted`);
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
    this.cacheExpiry.clear();
    this.emit('cache:cleared');
  }

  /**
   * 事件监听
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * 移除事件监听
   */
  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`事件监听器执行失败 [${event}]:`, error);
        }
      });
    }
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
   * 设置当前选中的儿童
   */
  setCurrentChild(child) {
    this.set('currentChild', child, 3600000); // 1小时过期
    // 同时保存到本地存储，确保跨页面一致性
    try {
      wx.setStorageSync('currentChild', child);
    } catch (error) {
      console.error('保存当前孩子到本地存储失败:', error);
    }
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
    try {
      wx.setStorageSync('currentChildIndex', index);
    } catch (error) {
      console.error('保存当前孩子索引到本地存储失败:', error);
    }
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
   * 清除孩子相关缓存
   */
  clearChildCache() {
    this.delete('currentChild');
    this.delete('currentChildIndex');
    this.delete('childrenList');
    try {
      wx.removeStorageSync('currentChild');
      wx.removeStorageSync('currentChildIndex');
    } catch (error) {
      console.error('清除本地存储的孩子数据失败:', error);
    }
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

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return {
      totalKeys: this.cache.size,
      keys: this.getCacheKeys(),
      memoryUsage: JSON.stringify([...this.cache.entries()]).length
    };
  }

  /**
   * 清理过期缓存
   */
  cleanExpiredCache() {
    const now = Date.now();
    const expiredKeys = [];
    
    this.cacheExpiry.forEach((expiry, key) => {
      if (now > expiry) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`清理了 ${expiredKeys.length} 个过期缓存:`, expiredKeys);
    }

    return expiredKeys.length;
  }
}

// 创建单例实例
const businessDataManager = new BusinessDataManager();

// 定期清理过期缓存
setInterval(() => {
  businessDataManager.cleanExpiredCache();
}, 60000); // 每分钟清理一次

module.exports = businessDataManager;