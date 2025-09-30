// 孩子视图页面逻辑editChild
const { childrenApi, tasksApi, rewardsApi, pointsApi } = require('../../utils/api-services.js');
const { createPageWithChildManager } = require('../../utils/page-mixins.js');
const { globalChildManager } = require('../../utils/global-child-manager.js');

Page(createPageWithChildManager({
  data: {
    loading: false,
    childrenList: [],
    currentChild: null,
    currentChildIndex: 0,
    
    // 积分相关
    todayPoints: 0,
    weekPoints: 0,
    
    // 任务相关
    pendingTasks: [],
    completedTasks: [],
    completedTasksToday: 0,
    totalTasksToday: 0,
    taskCompletionRate: 0,
    
    // 奖励相关
    availableRewards: [],
    allRewards: [],
    
    // 加载状态控制
    isLoadingPageData: false,
    isLoadingChildData: false,
    isLoadingTasks: false,
    isLoadingRewards: false,
    isLoadingPoints: false
  },

  // 防抖定时器
  loadChildDataTimer: null,
  childStateChangeTimer: null,

  onLoad: function (options) {
    console.log('child页面 onLoad');
    
    // 如果有传入的孩子ID，设置为当前孩子
    if (options.id) {
      this.setData({ selectedChildId: options.id });
    }
    
    // 先加载页面数据，这会初始化孩子列表和全局状态
    this.loadPageData();
  },

  onShow: function () {
    console.log('child页面 onShow');
    
    // 防止重复加载
    if (this.data.isLoadingPageData) {
      console.log('正在加载页面数据，跳过onShow加载');
      return;
    }
    
    // 先尝试同步全局孩子状态
    const syncResult = this.syncGlobalChildState();
    
    // 如果没有全局状态或同步失败，重新加载页面数据
    if (!syncResult.currentChild) {
      console.log('没有全局状态，重新加载页面数据');
      this.loadPageData();
    } else {
      console.log('有全局状态，只加载当前孩子数据');
      // 如果有全局状态，只需要加载当前孩子的数据
      this.loadChildData();
    }
  },

  onHide: function () {
    console.log('child页面 onHide');
    // 清理定时器
    this.clearTimers();
  },

  onUnload: function () {
    console.log('child页面 onUnload');
    // 清理定时器
    this.clearTimers();
  },

  // 清理定时器
  clearTimers: function() {
    if (this.loadChildDataTimer) {
      clearTimeout(this.loadChildDataTimer);
      this.loadChildDataTimer = null;
    }
    if (this.childStateChangeTimer) {
      clearTimeout(this.childStateChangeTimer);
      this.childStateChangeTimer = null;
    }
  },

  // 全局孩子状态变化回调
  onGlobalChildStateChanged: function(child, index) {
    console.log('孩子视图页面 - 孩子状态变化:', child ? child.name : '无', index);
    
    if (!child) {
      console.log('孩子状态变化：无孩子数据');
      return;
    }
    
    // 检查是否是相同的孩子，避免不必要的更新
    if (this.data.currentChild && this.data.currentChild._id === child._id) {
      console.log('孩子状态变化：相同孩子，跳过更新');
      return;
    }
    
    this.setData({
      currentChild: child,
      currentChildIndex: index
    });
    
    // 防止重复加载，添加防抖处理
    this.clearTimers();
    this.childStateChangeTimer = setTimeout(() => {
      console.log('孩子状态变化：开始加载孩子数据');
      this.loadChildData();
    }, 150); // 增加防抖时间
  },



  // 加载当前孩子的数据
  loadChildData: async function() {
    if (!this.data.currentChild) {
      console.log('loadChildData: 没有当前孩子');
      return;
    }
    
    // 防止重复加载
    if (this.data.isLoadingChildData) {
      console.log('正在加载孩子数据，跳过重复请求');
      return;
    }
    
    console.log('开始加载孩子数据:', this.data.currentChild.name);
    this.setData({ isLoadingChildData: true });
    
    try {
      // 先清空之前的数据
      this.setData({
        pendingTasks: [],
        completedTasks: [],
        availableRewards: [],
        allRewards: [],
        todayPoints: 0,
        weekPoints: 0,
        completedTasksToday: 0,
        totalTasksToday: 0,
        taskCompletionRate: 0
      });
      
      // 并行加载所有数据
      const loadPromises = [
        this.loadChildTasks(),
        this.loadChildRewards(),
        this.loadPointsStats()
      ];
      
      // 使用 Promise.allSettled 确保即使某个请求失败也不影响其他请求
      const results = await Promise.allSettled(loadPromises);
      
      // 检查结果并记录错误
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const loadTypes = ['任务', '奖励', '积分统计'];
          console.error(`加载${loadTypes[index]}失败:`, result.reason);
        }
      });
      
      console.log('孩子数据加载完成');
    } catch (error) {
      console.error('加载孩子数据失败:', error);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    } finally {
      this.setData({ isLoadingChildData: false });
    }
  },

  onPullDownRefresh: function () {
    this.loadPageData().then(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '刷新成功', icon: 'success' });
    }).catch(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '刷新失败', icon: 'none' });
    });
  },

  // 加载页面数据
  loadPageData: async function() {
    // 防止重复加载
    if (this.data.isLoadingPageData) {
      console.log('正在加载页面数据，跳过重复请求');
      return;
    }
    
    console.log('开始加载页面数据');
    this.setData({ 
      loading: true,
      isLoadingPageData: true 
    });
    
    try {
      // 先加载孩子列表
      await this.loadChildrenList();
      
      // 如果有当前孩子，加载孩子相关数据
      if (this.data.currentChild) {
        await this.loadChildData();
      }
      
      console.log('页面数据加载完成');
    } catch (error) {
      console.error('加载页面数据失败:', error);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    } finally {
      this.setData({ 
        loading: false,
        isLoadingPageData: false 
      });
    }
  },

  // 加载孩子列表
  loadChildrenList: async function() {
    try {
      const result = await childrenApi.getList();
      if (result.code === 0) {
        const childrenList = result.data || [];
        
        if (childrenList.length === 0) {
          // 没有孩子数据
          this.setData({ 
            childrenList: [],
            currentChild: null,
            currentChildIndex: 0
          });
          wx.showToast({ title: '请先添加孩子信息', icon: 'none' });
          return;
        }
        
        // 初始化全局孩子状态
        let { currentChild, currentChildIndex } = globalChildManager.initChildState(childrenList);
        
        // 如果有指定的孩子ID，优先使用指定的孩子
        if (this.data.selectedChildId) {
          const foundIndex = childrenList.findIndex(child => child._id === this.data.selectedChildId);
          if (foundIndex !== -1) {
            currentChild = childrenList[foundIndex];
            currentChildIndex = foundIndex;
            // 更新全局状态
            globalChildManager.switchChild(childrenList, foundIndex);
          }
        }
        
        // 更新页面混入的全局状态
        this.setGlobalChildrenList(childrenList);
        
        this.setData({ 
          childrenList,
          currentChild,
          currentChildIndex
        });
      } else {
        throw new Error(result.msg || '获取孩子列表失败');
      }
    } catch (error) {
      console.error('获取孩子列表失败:', error);
      wx.showToast({ title: '获取孩子列表失败', icon: 'none' });
      this.setData({ 
        childrenList: [],
        currentChild: null,
        currentChildIndex: 0
      });
      throw error;
    }
  },

  // 加载孩子的任务
  loadChildTasks: async function() {
    if (!this.data.currentChild) {
      console.log('loadChildTasks: 没有当前孩子');
      return;
    }
    
    // 防止重复加载
    if (this.data.isLoadingTasks) {
      console.log('正在加载任务，跳过重复请求');
      return;
    }
    
    this.setData({ isLoadingTasks: true });
    
    try {
      console.log('=== 开始获取任务列表 ===', this.data.currentChild.name);
      
      const result = await tasksApi.getMyTasks(this.data.currentChild._id);
      if (result.code === 0) {
        const tasks = result.data || [];
        const pendingTasks = tasks.filter(task => !task.isCompleted);
        const completedTasks = tasks.filter(task => task.isCompleted);
        
        // 计算今日任务完成情况（只统计daily类型的任务）
        const todayTasks = tasks.filter(task => task.taskType === 'daily');
        const completedTasksToday = todayTasks.filter(task => task.isCompleted).length;
        const totalTasksToday = todayTasks.length;
        const taskCompletionRate = totalTasksToday > 0 ? Math.round((completedTasksToday / totalTasksToday) * 100) : 0;
        
        console.log('任务加载完成:', {
          total: tasks.length,
          pending: pendingTasks.length,
          completed: completedTasks.length,
          todayRate: taskCompletionRate
        });
        
        this.setData({
          pendingTasks,
          completedTasks,
          completedTasksToday,
          totalTasksToday,
          taskCompletionRate
        });
      } else {
        throw new Error(result.msg || '获取任务列表失败');
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
      // 设置默认值，不影响其他功能
      this.setData({
        pendingTasks: [],
        completedTasks: [],
        completedTasksToday: 0,
        totalTasksToday: 0,
        taskCompletionRate: 0
      });
      throw error;
    } finally {
      this.setData({ isLoadingTasks: false });
    }
  },

  // 加载奖励列表
  loadChildRewards: async function() {
    if (!this.data.currentChild) {
      console.log('loadChildRewards: 没有当前孩子');
      return;
    }
    
    // 防止重复加载
    if (this.data.isLoadingRewards) {
      console.log('正在加载奖励，跳过重复请求');
      return;
    }
    
    this.setData({ isLoadingRewards: true });
    
    try {
      console.log('=== 开始获取奖励列表 ===', this.data.currentChild.name);
      
      const result = await rewardsApi.getMyRewards(this.data.currentChild._id);
      if (result.code === 0) {
        const allRewards = result.data || [];
        const availableRewards = allRewards.filter(reward => reward.canExchange);
        
        console.log('奖励加载完成:', {
          total: allRewards.length,
          available: availableRewards.length
        });
        
        this.setData({
          allRewards,
          availableRewards
        });
      } else {
        throw new Error(result.msg || '获取奖励列表失败');
      }
    } catch (error) {
      console.error('获取奖励列表失败:', error);
      // 设置默认值，不影响其他功能
      this.setData({
        allRewards: [],
        availableRewards: []
      });
    } finally {
      this.setData({ isLoadingRewards: false });
    }
  },

  // 加载积分统计
  loadPointsStats: async function() {
    if (!this.data.currentChild) {
      console.log('loadPointsStats: 没有当前孩子');
      return;
    }
    
    // 防止重复加载
    if (this.data.isLoadingPoints) {
      console.log('正在加载积分统计，跳过重复请求');
      return;
    }
    
    this.setData({ isLoadingPoints: true });
    
    try {
      console.log('=== 开始获取积分统计 ===', this.data.currentChild.name);
      
      const result = await pointsApi.getStatistics(this.data.currentChild._id);
      if (result.code === 0) {
        const stats = result.data || {};
        
        console.log('积分统计加载完成:', stats);
        
        this.setData({
          todayPoints: stats.todayPoints || 0,
          weekPoints: stats.weekPoints || 0
        });
      } else {
        throw new Error(result.msg || '获取积分统计失败');
      }
    } catch (error) {
      console.error('获取积分统计失败:', error);
      // 积分统计失败不影响主要功能，设置默认值
      this.setData({
        todayPoints: 0,
        weekPoints: 0
      });
    } finally {
      this.setData({ isLoadingPoints: false });
    }
  },

  // 孩子选择事件
  onChildSelected: function(e) {
    const { child, childId } = e.detail;
    
    console.log('孩子选择器变化:', child.name, childId);
    
    // 更新当前选中的孩子
    this.setData({
      currentChild: child
    });

    // 使用全局状态管理切换孩子
    const childIndex = this.data.childrenList.findIndex(c => c._id === childId);
    if (childIndex >= 0) {
      const success = globalChildManager.switchChild(this.data.childrenList, childIndex);
      
      if (success) {
        this.setData({
          currentChildIndex: childIndex
        });
        
        // 触发联动更新机制，加载新孩子的数据
        this.clearTimers();
        this.childStateChangeTimer = setTimeout(() => {
          console.log('孩子选择变化：开始加载孩子数据');
          this.loadChildData();
        }, 150);
      } else {
        wx.showToast({
          title: '切换失败',
          icon: 'none'
        });
      }
    }
  },

  // 编辑孩子信息
  onChildEdit: function(e) {
    const { child, childId } = e.detail;
    
    console.log('编辑孩子:', child.name);
    
    // 跳转到编辑孩子页面
    wx.navigateTo({
      url: `/pages/child/addchild?action=edit&childId=${childId}`
    });
  },

  // 删除孩子
  onChildDelete: function(e) {
    const { child, childId } = e.detail;
    
    console.log('删除孩子:', child.name);
    
    // 调用API删除孩子
    this.deleteChildFromServer(childId, child.name);
  },

  // 从服务器删除孩子
  deleteChildFromServer: async function(childId, childName) {
    try {
      wx.showLoading({
        title: '删除中...',
        mask: true
      });

      // 调用删除API
      const result = await childrenApi.delete(childId);
      
      wx.hideLoading();
      
      if (result.code === 0) {
        wx.showToast({
          title: `${childName} 已删除`,
          icon: 'success'
        });
        
        // 重新加载页面数据
        this.loadPageData();
      } else if (result.code === 1) {
        // 需要确认删除（有关联数据）
        wx.showModal({
          title: '确认删除',
          content: `${result.msg}

相关数据：
任务记录: ${result.data.relatedData.taskRecords}条
积分记录: ${result.data.relatedData.pointRecords}条
兑换记录: ${result.data.relatedData.exchangeRecords}条`,
          confirmText: '强制删除',
          cancelText: '取消',
          success: async (res) => {
            if (res.confirm) {
              // 强制删除
              try {
                wx.showLoading({ title: '删除中...', mask: true });
                const forceResult = await childrenApi.delete(childId, true);
                wx.hideLoading();
                
                if (forceResult.code === 0) {
                  wx.showToast({
                    title: `${childName} 已删除`,
                    icon: 'success'
                  });
                  this.loadPageData();
                } else {
                  wx.showToast({
                    title: forceResult.msg || '删除失败',
                    icon: 'none'
                  });
                }
              } catch (error) {
                wx.hideLoading();
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                });
              }
            }
          }
        });
      } else {
        wx.showToast({
          title: result.msg || '删除失败',
          icon: 'none'
        });
      }
      
    } catch (error) {
      wx.hideLoading();
      console.error('删除孩子失败:', error);
      
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  // 完成任务
  onTaskComplete: async function(e) {
    const task = e.detail.task;
    
    if (!this.data.currentChild) {
      wx.showToast({ title: '请先选择孩子', icon: 'none' });
      return;
    }
    
    try {
      wx.showLoading({ title: '完成任务中...' });
      
      const result = await tasksApi.complete(task._id, this.data.currentChild._id);
      if (result.code === 0) {
        wx.showToast({ title: `恭喜！获得${task.points}积分`, icon: 'success' });
        
        // 只刷新相关数据，不重新加载整个页面
        await Promise.all([
          this.loadChildTasks(),
          this.loadPointsStats()
        ]);
        
        // 触发任务数据更新事件，通知其他页面
        const taskDataManager = require('../../utils/task-data-manager.js');
        taskDataManager.triggerTaskDataChanged();
      } else {
        wx.showToast({ title: result.msg || '完成任务失败', icon: 'none' });
      }
    } catch (error) {
      console.error('完成任务失败:', error);
      wx.showToast({ title: '完成任务失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 兑换奖励
  onRewardExchange: async function(e) {
    const reward = e.detail.reward;
    
    if (!this.data.currentChild) {
      wx.showToast({ title: '请先选择孩子', icon: 'none' });
      return;
    }
    
    try {
      wx.showLoading({ title: '兑换中...' });
      
      const result = await rewardsApi.exchange(reward._id, this.data.currentChild._id);
      if (result.code === 0) {
        wx.showToast({ title: `恭喜！兑换成功`, icon: 'success' });
        
        // 只刷新相关数据，不重新加载整个页面
        await Promise.all([
          this.loadChildRewards(),
          this.loadPointsStats()
        ]);
      } else {
        wx.showToast({ title: result.msg || '兑换失败', icon: 'none' });
      }
    } catch (error) {
      console.error('兑换失败:', error);
      wx.showToast({ title: '兑换失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 跳转到添加孩子页面
  navigateToAddChild: function () {
    wx.navigateTo({
      url: '/pages/child/addchild'
    });
  }
}));