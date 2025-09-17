// 孩子视图页面逻辑
const { childrenApi, tasksApi, rewardsApi, pointsApi } = require('../../utils/api-services.js');
const { createPageWithChildManager } = require('../../utils/page-mixins.js');

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
    allRewards: []
  },

  onLoad: function (options) {
    // 如果有传入的孩子ID，设置为当前孩子
    if (options.id) {
      this.setData({ selectedChildId: options.id });
    }
    
    // 先加载页面数据，这会初始化孩子列表和全局状态
    this.loadPageData();
  },

  onShow: function () {
    // 先尝试同步全局孩子状态
    const syncResult = this.syncGlobalChildState();
    
    // 如果没有全局状态或同步失败，重新加载页面数据
    if (!syncResult.globalCurrentChild) {
      this.loadPageData();
    } else {
      // 如果有全局状态，只需要加载当前孩子的数据
      this.loadChildData();
    }
  },

  // 全局孩子状态变化回调
  onGlobalChildStateChanged: function(child, index) {
    console.log('孩子视图页面 - 孩子状态变化:', child ? child.name : '无', index);
    if (child) {
      this.setData({
        currentChild: child,
        currentChildIndex: index
      });
      
      // 防止重复加载，添加防抖处理
      clearTimeout(this.loadChildDataTimer);
      this.loadChildDataTimer = setTimeout(() => {
        this.loadChildData();
      }, 100);
    }
  },



  // 加载当前孩子的数据
  loadChildData: async function() {
    if (!this.data.currentChild) return;
    
    // 防止重复加载
    if (this.loadingChildData) {
      console.log('正在加载孩子数据，跳过重复请求');
      return;
    }
    
    this.loadingChildData = true;
    
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
      
      await Promise.all([
        this.loadChildTasks(),
        this.loadChildRewards(),
        this.loadPointsStats()
      ]);
    } catch (error) {
      console.error('加载孩子数据失败:', error);
    } finally {
      this.loadingChildData = false;
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
    this.setData({ loading: true });
    
    try {
      await this.loadChildrenList();
      if (this.data.currentChild) {
        await Promise.all([
          this.loadChildTasks(),
          this.loadChildRewards(),
          this.loadPointsStats()
        ]);
      }
    } catch (error) {
      console.error('加载页面数据失败:', error);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
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
        
        // 设置全局孩子列表
        this.setGlobalChildrenList(childrenList);
        
        // 获取当前孩子状态
        let currentChild = this.getCurrentChild();
        let currentChildIndex = this.getCurrentChildIndex();
        
        // 如果没有当前孩子或当前孩子不在列表中，使用第一个孩子
        if (!currentChild || !childrenList.find(child => child._id === currentChild._id)) {
          currentChild = childrenList[0];
          currentChildIndex = 0;
          this.switchChild(0);
        }
        
        // 如果有指定的孩子ID，优先使用指定的孩子
        if (this.data.selectedChildId) {
          const foundIndex = childrenList.findIndex(child => child._id === this.data.selectedChildId);
          if (foundIndex !== -1) {
            currentChild = childrenList[foundIndex];
            currentChildIndex = foundIndex;
            // 更新全局状态
            this.switchChild(foundIndex);
          }
        }
        
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
    if (!this.data.currentChild) return;
    
    try {
      console.log('=== 开始获取任务列表 ===')
      console.log('当前孩子:', this.data.currentChild)
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
        
        this.setData({
          pendingTasks,
          completedTasks,
          completedTasksToday,
          totalTasksToday,
          taskCompletionRate
        });
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
      throw error;
    }
  },

  // 加载奖励列表
  loadChildRewards: async function() {
    if (!this.data.currentChild) return;
    
    try {
      const result = await rewardsApi.getMyRewards(this.data.currentChild._id);
      if (result.code === 0) {
        const allRewards = result.data || [];
        console.log('所有奖励:', allRewards);
        const availableRewards = allRewards.filter(reward => reward.canExchange);
        
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
    }
  },  
    
    

  // 加载积分统计
  loadPointsStats: async function() {
    if (!this.data.currentChild) return;
    
    try {
      const result = await pointsApi.getStatistics(this.data.currentChild._id);
      if (result.code === 0) {
        const stats = result.data || {};
        this.setData({
          todayPoints: stats.todayPoints || 0,
          weekPoints: stats.weekPoints || 0
        });
      }
    } catch (error) {
      console.error('获取积分统计失败:', error);
      // 积分统计失败不影响主要功能，设置默认值
      this.setData({
        todayPoints: 0,
        weekPoints: 0
      });
    }
  },

  // 切换孩子
  onChildChange: function(e) {
    const index = e.detail.value;
    const childrenList = this.data.childrenList;
    
    if (index >= 0 && index < childrenList.length) {
      // 使用全局状态管理切换孩子
      const success = this.switchChild(index);
      
      if (success) {
        const currentChild = childrenList[index];
        
        this.setData({
          currentChildIndex: index,
          currentChild
        });

        // 显示切换提示
        wx.showToast({
          title: `已切换到 ${currentChild.name}`,
          icon: 'success',
          duration: 1000
        });
        
        // 防止重复加载，因为switchChild会触发onGlobalChildStateChanged
        // 这里不需要再调用loadChildData，让全局状态变化回调处理
      } else {
        wx.showToast({
          title: '切换失败',
          icon: 'none'
        });
      }
    }
  },

  // 完成任务
  onTaskComplete: async function(e) {
    const task = e.detail.task;
    
    try {
      wx.showLoading({ title: '完成任务中...' });
      
      const result = await tasksApi.complete(task._id, this.data.currentChild._id);
      if (result.code === 0) {
        wx.showToast({ title: `恭喜！获得${task.points}积分`, icon: 'success' });
        
        // 刷新数据
        await this.loadPageData();
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
    
    try {
      wx.showLoading({ title: '兑换中...' });
      
      const result = await rewardsApi.exchange(reward._id, this.data.currentChild._id);
      if (result.code === 0) {
        wx.showToast({ title: `恭喜！获得${reward.points}积分`, icon: 'success' });
        
        // 刷新数据
        await this.loadPageData();
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