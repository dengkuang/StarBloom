// 任务管理页面逻辑 - 使用API服务层获取真实数据
const { tasksApi, childrenApi, dictionaryApi } = require('../../utils/api-services.js');
const { createPageWithChildManager } = require('../../utils/page-mixins.js');

Page(createPageWithChildManager({
  data: {
    taskList: [],
    loading: false,
    error: null,
    filters: {
      childId: '',
      status: '',
      type: ''
    },
    filterOptions: {
      children: [],
      statuses: [],
      types: []
    },
    showFilterPanel: false,
    currentPage: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad: function () {
    // 初始化全局孩子状态
    this.initGlobalChildState();
    this.loadFilterOptions();
    this.loadTaskList();
  },

  onShow: function () {
    // 同步全局孩子状态
    this.syncGlobalChildState();
    // 页面显示时检查数据是否需要刷新
    this.checkDataRefresh();
  },

  // 全局孩子状态变化回调
  onGlobalChildStateChanged: function(child, index) {
    console.log('任务页面 - 孩子状态变化:', child ? child.name : '无', index);
    // 当孩子切换时，更新筛选条件并重新加载任务
    if (child) {
      this.setData({
        'filters.childId': child._id,
        currentPage: 1,
        hasMore: true
      });
      this.loadTaskList();
    }
  },

  loadFilterOptions: async function() {
    try {
      // 加载儿童选项
      const childrenResult = await childrenApi.getList();
      if (childrenResult.code === 0) {
        this.setData({
          'filterOptions.children': childrenResult.data
        });
      }

      // 加载状态选项（从字典获取）
      const statusResult = await dictionaryApi.getByCategory('task_status');
      if (statusResult.code === 0) {
        this.setData({
          'filterOptions.statuses': statusResult.data
        });
      }

      // 加载类型选项（从字典获取）
      const typeResult = await dictionaryApi.getByCategory('task_type');
      if (typeResult.code === 0) {
        this.setData({
          'filterOptions.types': typeResult.data
        });
      }
    } catch (error) {
      console.error('加载筛选选项失败:', error);
    }
  },

  loadTaskList: async function() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true, error: null });

    try {
      const queryOptions = {
        ...this.data.filters,
        page: this.data.currentPage,
        limit: this.data.pageSize
      };

      const result = await tasksApi.getList(queryOptions);
      if (result.code === 0) {
        const newTaskList = result.data;
        const allTasks = this.data.currentPage === 1 ? newTaskList : [...this.data.taskList, ...newTaskList];
        
        this.setData({
          taskList: allTasks,
          hasMore: newTaskList.length === this.data.pageSize,
          loading: false
        });

        // 缓存任务列表
        businessDataManager.setTaskList(allTasks);
      } else {
        throw new Error(result.msg || '获取任务列表失败');
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
      this.setData({ 
        loading: false, 
        error: '获取任务列表失败，请下拉刷新重试' 
      });
      wx.showToast({ title: '获取任务列表失败', icon: 'none' });
    }
  },

  onFilterChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`filters.${field}`]: value,
      currentPage: 1,
      hasMore: true
    });

    // 防抖处理，避免频繁请求
    clearTimeout(this.filterTimer);
    this.filterTimer = setTimeout(() => {
      this.loadTaskList();
    }, 300);
  },

  toggleFilterPanel: function() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    });
  },

  onCompleteTask: async function(e) {
    const { taskid, childid } = e.currentTarget.dataset;
    
    try {
      const result = await tasksApi.complete(taskid, childid);
      if (result.code === 0) {
        wx.showToast({ title: '任务完成成功', icon: 'success' });
        
        // 刷新任务列表
        this.setData({ currentPage: 1, hasMore: true });
        this.loadTaskList();
      } else {
        throw new Error(result.msg || '完成任务失败');
      }
    } catch (error) {
      console.error('完成任务失败:', error);
      wx.showToast({ title: '完成任务失败', icon: 'none' });
    }
  },

  onEditTask: function(e) {
    const { task } = e.detail;
    // 跳转到编辑任务页面
    wx.navigateTo({
      url: `/pages/task-edit/task-edit?id=${task._id}`
    });
  },

  onDeleteTask: async function(e) {
    const { task } = e.detail;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除任务"${task.name}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await tasksApi.delete(task._id);
            if (result.code === 0) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              
              // 刷新任务列表
              this.setData({ currentPage: 1, hasMore: true });
              this.loadTaskList();
            } else {
              throw new Error(result.msg || '删除任务失败');
            }
          } catch (error) {
            console.error('删除任务失败:', error);
            wx.showToast({ title: '删除任务失败', icon: 'none' });
          }
        }
      }
    });
  },

  onPullDownRefresh: function() {
    // 下拉刷新
    wx.showNavigationBarLoading();
    this.setData({ currentPage: 1, hasMore: true });
    this.loadTaskList()
      .then(() => {
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading();
        wx.showToast({ title: '刷新成功', icon: 'success' });
      })
      .catch(() => {
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading();
        wx.showToast({ title: '刷新失败', icon: 'none' });
      });
  },

  onReachBottom: function() {
    // 上拉加载更多
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ currentPage: this.data.currentPage + 1 });
      this.loadTaskList();
    }
  },

  checkDataRefresh: function() {
    // 检查数据是否需要刷新
    const now = Date.now();
    const taskListExpiry = businessDataManager.cacheExpiry.get('taskList') || 0;
    
    // 如果缓存过期超过1分钟，则刷新数据
    if (now - taskListExpiry > 60000) {
      this.setData({ currentPage: 1, hasMore: true });
      this.loadTaskList();
    }
  },

  onRetry: function() {
    // 重试加载数据
    this.setData({ error: null, currentPage: 1, hasMore: true });
    this.loadTaskList();
  },

  navigateToAddTask: function() {
    // 跳转到添加任务页面
    wx.navigateTo({
      url: '/pages/task-edit/task-edit'
    });
  },

  onShareAppMessage: function() {
    return {
      title: '任务管理 - StarBloom',
      path: '/pages/tasks/tasks',
      imageUrl: '/images/share-cover.jpg'
    };
  }
}));