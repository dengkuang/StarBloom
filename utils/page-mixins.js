// 页面混入工具集合 - 专注于页面级功能混入
const { withGlobalChildManager } = require('./global-child-manager.js');
const businessDataManager = require('./businessDataManager.js');

/**
 * 创建带有全局孩子状态管理的页面
 * 使用示例：
 * 
 * const { createPageWithChildManager } = require('../../utils/page-mixins.js');
 * 
 * Page(createPageWithChildManager({
 *   data: {
 *     // 页面自定义数据
 *   },
 * 
 *   onLoad: function() {
 *     // 初始化全局孩子状态
 *     this.initGlobalChildState();
 *   },
 * 
 *   // 自定义孩子状态变化回调
 *   onGlobalChildStateChanged: function(child, index) {
 *     console.log('孩子状态变化:', child.name, index);
 *     // 重新加载页面数据
 *     this.loadPageData();
 *   },
 * 
 *   // 自定义孩子切换回调
 *   onGlobalChildSwitched: function(child, index) {
 *     console.log('孩子切换:', child.name, index);
 *     // 执行切换后的逻辑
 *   }
 * }));
 */
function createPageWithChildManager(pageOptions) {
  return withGlobalChildManager(pageOptions);
}

/**
 * 任务页面混入
 * 为任务相关页面提供通用功能
 */
const TaskPageMixin = {
  data: {
    taskList: [],
    loading: false
  },

  // 加载任务列表
  loadTaskList: async function() {
    const currentChild = this.getCurrentChild();
    if (!currentChild) {
      this.setData({ taskList: [] });
      return;
    }

    // 先尝试从缓存获取
    const cachedTasks = businessDataManager.getTaskList();
    if (cachedTasks) {
      this.setData({ taskList: cachedTasks });
      return;
    }

    this.setData({ loading: true });
    
    try {
      const { tasksApi } = require('./api-services.js');
      const result = await tasksApi.getList({ childId: currentChild._id });
      
      if (result.code === 0) {
        const taskList = result.data || [];
        this.setData({ taskList });
        // 缓存任务列表
        businessDataManager.setTaskList(taskList);
      } else {
        wx.showToast({ title: result.msg || '加载任务失败', icon: 'none' });
      }
    } catch (error) {
      console.error('加载任务列表失败:', error);
      wx.showToast({ title: '加载任务失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 孩子状态变化时重新加载任务
  onGlobalChildStateChanged: function(child, index) {
    this.loadTaskList();
  }
};

/**
 * 奖励页面混入
 * 为奖励相关页面提供通用功能
 */
const RewardPageMixin = {
  data: {
    rewardList: [],
    availableRewards: [],
    loading: false
  },

  // 加载奖励列表
  loadRewardList: async function() {
    const currentChild = this.getCurrentChild();
    
    // 先尝试从缓存获取
    const cachedRewards = businessDataManager.getRewardList();
    if (cachedRewards) {
      const currentPoints = currentChild ? (currentChild.totalPoints || 0) : 0;
      const availableRewards = cachedRewards.filter(reward => reward.points <= currentPoints);
      
      this.setData({ 
        rewardList: cachedRewards,
        availableRewards: availableRewards
      });
      return;
    }

    this.setData({ loading: true });
    
    try {
      const { rewardsApi } = require('./api-services.js');
      const result = await rewardsApi.getList();
      
      if (result.code === 0) {
        const allRewards = result.data || [];
        const currentPoints = currentChild ? (currentChild.totalPoints || 0) : 0;
        const availableRewards = allRewards.filter(reward => reward.points <= currentPoints);
        
        this.setData({ 
          rewardList: allRewards,
          availableRewards: availableRewards
        });

        // 缓存奖励列表
        businessDataManager.setRewardList(allRewards);
      } else {
        wx.showToast({ title: result.msg || '加载奖励失败', icon: 'none' });
      }
    } catch (error) {
      console.error('加载奖励列表失败:', error);
      wx.showToast({ title: '加载奖励失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 孩子状态变化时重新加载奖励
  onGlobalChildStateChanged: function(child, index) {
    this.loadRewardList();
  }
};

/**
 * 创建带有任务管理功能的页面
 */
function createTaskPage(pageOptions) {
  // 合并任务页面混入
  pageOptions.data = Object.assign({}, TaskPageMixin.data, pageOptions.data || {});
  
  Object.keys(TaskPageMixin).forEach(key => {
    if (key !== 'data' && typeof TaskPageMixin[key] === 'function') {
      if (pageOptions[key] && typeof pageOptions[key] === 'function') {
        // 如果页面已有同名方法，创建组合方法
        const originalMethod = pageOptions[key];
        const mixinMethod = TaskPageMixin[key];
        
        pageOptions[key] = function(...args) {
          // 先调用混入方法
          const mixinResult = mixinMethod.apply(this, args);
          // 再调用原始方法
          const originalResult = originalMethod.apply(this, args);
          // 返回原始方法的结果
          return originalResult;
        };
      } else {
        pageOptions[key] = TaskPageMixin[key];
      }
    }
  });

  return createPageWithChildManager(pageOptions);
}

/**
 * 创建带有奖励管理功能的页面
 */
function createRewardPage(pageOptions) {
  // 合并奖励页面混入
  pageOptions.data = Object.assign({}, RewardPageMixin.data, pageOptions.data || {});
  
  Object.keys(RewardPageMixin).forEach(key => {
    if (key !== 'data' && typeof RewardPageMixin[key] === 'function') {
      if (pageOptions[key] && typeof pageOptions[key] === 'function') {
        // 如果页面已有同名方法，创建组合方法
        const originalMethod = pageOptions[key];
        const mixinMethod = RewardPageMixin[key];
        
        pageOptions[key] = function(...args) {
          // 先调用混入方法
          const mixinResult = mixinMethod.apply(this, args);
          // 再调用原始方法
          const originalResult = originalMethod.apply(this, args);
          // 返回原始方法的结果
          return originalResult;
        };
      } else {
        pageOptions[key] = RewardPageMixin[key];
      }
    }
  });

  return createPageWithChildManager(pageOptions);
}

module.exports = {
  createPageWithChildManager,
  createTaskPage,
  createRewardPage,
  TaskPageMixin,
  RewardPageMixin
};