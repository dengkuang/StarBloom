// 任务数据管理器 - 专门处理任务数据的更新通知
const businessDataManager = require('./businessDataManager.js');

/**
 * 任务数据管理器
 */
class TaskDataManager {
  constructor() {
    this.dataManager = businessDataManager;
  }

  /**
   * 设置任务列表
   */
  setTaskList(taskList) {
    this.dataManager.setTaskList(taskList);
    // 触发任务列表更新事件
    this.notifyTaskListUpdated(taskList);
  }

  /**
   * 获取任务列表
   */
  getTaskList() {
    return this.dataManager.getTaskList();
  }

  /**
   * 通知任务列表已更新
   */
  notifyTaskListUpdated(taskList) {
    // 使用小程序的事件总线机制通知所有页面
    const pages = getCurrentPages();
    pages.forEach(page => {
      if (page.onTaskDataUpdated && typeof page.onTaskDataUpdated === 'function') {
        try {
          page.onTaskDataUpdated(taskList);
        } catch (error) {
          console.error('页面任务数据更新回调执行失败:', error);
        }
      }
    });

    // 触发数据管理器的事件
    this.dataManager.emit('task:list:updated', taskList);
  }

  /**
   * 通知单个任务已更新
   */
  notifyTaskUpdated(updatedTask) {
    // 更新缓存中的任务列表
    const currentTaskList = this.getTaskList();
    if (currentTaskList && Array.isArray(currentTaskList)) {
      const updatedTaskList = currentTaskList.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      );
      this.setTaskList(updatedTaskList);
    }

    // 触发单个任务更新事件
    this.dataManager.emit('task:updated', updatedTask);
  }

  /**
   * 通知任务已删除
   */
  notifyTaskDeleted(taskId) {
    // 更新缓存中的任务列表
    const currentTaskList = this.getTaskList();
    if (currentTaskList && Array.isArray(currentTaskList)) {
      const updatedTaskList = currentTaskList.filter(task => task._id !== taskId);
      this.setTaskList(updatedTaskList);
    }

    // 触发任务删除事件
    this.dataManager.emit('task:deleted', taskId);
  }

  /**
   * 通知任务已添加
   */
  notifyTaskAdded(newTask) {
    // 更新缓存中的任务列表
    const currentTaskList = this.getTaskList() || [];
    const updatedTaskList = [...currentTaskList, newTask];
    this.setTaskList(updatedTaskList);

    // 触发任务添加事件
    this.dataManager.emit('task:added', newTask);
  }

  /**
   * 监听任务数据变化
   */
  onTaskListUpdated(callback) {
    this.dataManager.on('task:list:updated', callback);
  }

  /**
   * 监听单个任务更新
   */
  onTaskUpdated(callback) {
    this.dataManager.on('task:updated', callback);
  }

  /**
   * 监听任务添加
   */
  onTaskAdded(callback) {
    this.dataManager.on('task:added', callback);
  }

  /**
   * 监听任务删除
   */
  onTaskDeleted(callback) {
    this.dataManager.on('task:deleted', callback);
  }

  /**
   * 移除监听器
   */
  offTaskListUpdated(callback) {
    this.dataManager.off('task:list:updated', callback);
  }

  /**
   * 移除所有任务相关监听器
   */
  offAllTaskListeners() {
    this.dataManager.off('task:list:updated');
    this.dataManager.off('task:updated');
    this.dataManager.off('task:added');
    this.dataManager.off('task:deleted');
  }

  /**
   * 强制刷新任务数据（清除缓存并通知重新获取）
   */
  forceRefreshTaskData() {
    // 清除任务列表缓存
    this.dataManager.delete('taskList');
    
    // 触发强制刷新事件
    this.dataManager.emit('task:list:updated');
    
    // 通知所有页面需要重新获取数据
    const pages = getCurrentPages();
    pages.forEach(page => {
      if (page.onTaskForceRefresh && typeof page.onTaskForceRefresh === 'function') {
        try {
          page.onTaskForceRefresh();
        } catch (error) {
          console.error('页面强制刷新回调执行失败:', error);
        }
      }
    });

    console.log('✅ [任务数据] 强制刷新任务数据');
  }

  /**
   * 获取任务数据统计
   */
  getTaskStats() {
    const taskList = this.getTaskList();
    if (!taskList || !Array.isArray(taskList)) {
      return { total: 0, active: 0, completed: 0 };
    }

    return {
      total: taskList.length,
      active: taskList.filter(task => !task.completed).length,
      completed: taskList.filter(task => task.completed).length
    };
  }
}

/**
 * 任务数据管理混入
 * 为页面提供统一的任务数据管理功能
 */
const TaskDataManagerMixin = {
  data: {
    // 任务数据状态
    taskList: [],
    taskDataLastUpdated: 0
  },

  /**
   * 初始化任务数据状态
   */
  initTaskDataState: function() {
    const taskList = taskDataManager.getTaskList() || [];
    
    this.setData({
      taskList: taskList,
      taskDataLastUpdated: Date.now()
    });

    return taskList;
  },

  /**
   * 同步任务数据状态
   */
  syncTaskDataState: function() {
    const taskList = taskDataManager.getTaskList() || [];

    // 检查是否需要更新
    const needUpdate = this.data.taskList.length !== taskList.length ||
                      this.data.taskDataLastUpdated < (Date.now() - 60000); // 1分钟强制更新

    if (needUpdate) {
      this.setData({
        taskList: taskList,
        taskDataLastUpdated: Date.now()
      });

      // 如果页面有自定义的同步回调，则调用
      if (this.onTaskDataStateChanged && typeof this.onTaskDataStateChanged === 'function') {
        this.onTaskDataStateChanged(taskList);
      }
    }

    return taskList;
  },

  /**
   * 任务数据更新回调
   */
  onTaskDataUpdated: function(taskList) {
    this.setData({
      taskList: taskList,
      taskDataLastUpdated: Date.now()
    });

    // 如果页面有自定义的更新回调，则调用
    if (this.onTaskDataStateChanged && typeof this.onTaskDataStateChanged === 'function') {
      this.onTaskDataStateChanged(taskList);
    }

    console.log('✅ [任务数据] 页面任务数据已更新，任务数量:', taskList.length);
  },

  /**
   * 强制刷新任务数据回调
   */
  onTaskForceRefresh: function() {
    // 清除页面缓存的任务数据
    this.setData({
      taskList: [],
      taskDataLastUpdated: 0
    });

    // 如果页面有加载任务数据的方法，则调用
    if (this.loadTaskData && typeof this.loadTaskData === 'function') {
      this.loadTaskData();
    }

    console.log('✅ [任务数据] 页面任务数据强制刷新');
  },

  /**
   * 获取当前任务列表
   */
  getCurrentTaskList: function() {
    return this.data.taskList.length > 0 ? 
           this.data.taskList : 
           taskDataManager.getTaskList() || [];
  },

  /**
   * 设置任务列表
   */
  setTaskList: function(taskList) {
    taskDataManager.setTaskList(taskList);
    
    this.setData({
      taskList: taskList,
      taskDataLastUpdated: Date.now()
    });
  },

  /**
   * 添加任务
   */
  addTask: function(newTask) {
    taskDataManager.notifyTaskAdded(newTask);
  },

  /**
   * 更新任务
   */
  updateTask: function(updatedTask) {
    taskDataManager.notifyTaskUpdated(updatedTask);
  },

  /**
   * 删除任务
   */
  deleteTask: function(taskId) {
    taskDataManager.notifyTaskDeleted(taskId);
  },

  /**
   * 强制刷新任务数据
   */
  forceRefreshTasks: function() {
    taskDataManager.forceRefreshTaskData();
  }
};

/**
 * 为页面添加任务数据管理功能
 */
function withTaskDataManager(pageOptions) {
  // 合并数据
  pageOptions.data = Object.assign({}, TaskDataManagerMixin.data, pageOptions.data || {});

  // 合并方法
  Object.keys(TaskDataManagerMixin).forEach(key => {
    if (key !== 'data' && typeof TaskDataManagerMixin[key] === 'function') {
      // 如果页面已有同名方法，保留原方法并添加前缀
      if (pageOptions[key] && typeof pageOptions[key] === 'function') {
        pageOptions[`_original_${key}`] = pageOptions[key];
      }
      pageOptions[key] = TaskDataManagerMixin[key];
    }
  });

  // 增强 onShow 方法
  const originalOnShow = pageOptions.onShow;
  pageOptions.onShow = function() {
    // 先调用原始的 onShow
    if (originalOnShow && typeof originalOnShow === 'function') {
      originalOnShow.call(this);
    }
    
    // 然后同步任务数据状态
    this.syncTaskDataState();
  };

  // 增强 onLoad 方法，添加事件监听
  const originalOnLoad = pageOptions.onLoad;
  pageOptions.onLoad = function(options) {
    // 先调用原始的 onLoad
    if (originalOnLoad && typeof originalOnLoad === 'function') {
      originalOnLoad.call(this, options);
    }
    
    // 监听任务数据更新事件
    taskDataManager.onTaskListUpdated(this.onTaskDataUpdated.bind(this));
    
    // 监听强制刷新事件
    taskDataManager.dataManager.on('task:force:refresh', this.onTaskForceRefresh.bind(this));
  };

  // 增强 onUnload 方法，移除事件监听
  const originalOnUnload = pageOptions.onUnload;
  pageOptions.onUnload = function() {
    // 移除事件监听
    taskDataManager.offAllTaskListeners();
    
    // 调用原始的 onUnload
    if (originalOnUnload && typeof originalOnUnload === 'function') {
      originalOnUnload.call(this);
    }
  };

  return pageOptions;
}

// 创建全局实例
const taskDataManager = new TaskDataManager();

module.exports = {
  TaskDataManager,
  TaskDataManagerMixin,
  withTaskDataManager,
  taskDataManager
};