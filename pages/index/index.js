// 家长管理首页逻辑 - 重构版
const { userApi, childrenApi, tasksApi, rewardsApi, pointsApi } = require('../../utils/api-services.js');
const businessDataManager = require('../../utils/businessDataManager.js');
const { globalChildManager } = require('../../utils/global-child-manager.js');

Page({
  data: {
    loading: false,
    error: null,
    
    // 用户信息
    userInfo: null,
    currentDate: '',
    unreadCount: 0,
    
    // 孩子相关
    childrenList: [],
    currentChild: null,
    currentChildIndex: 0,
   
    //任务相关
    Tasks: [],
    
    // 奖励相关
    Rewards: [],
    
    
    // 工具方法
    Math: Math
  },

  onLoad: function () {
    this.loadPageData();
  },

  onShow: function () {
    // 页面显示时检查数据是否需要刷新
    this.checkDataRefresh();
    
    // 同步全局孩子状态
    this.syncGlobalChildState();
  },

  // 同步全局孩子状态
  syncGlobalChildState: function() {
    const state = globalChildManager.getCurrentState();
    
    // 如果全局状态与当前页面状态不一致，则同步
    if (state.currentChild && 
        (!this.data.currentChild || this.data.currentChild._id !== state.currentChild._id)) {
      
      // 查找对应的孩子在当前列表中的索引
      const foundIndex = this.data.childrenList.findIndex(child => child._id === state.currentChild._id);
      
      if (foundIndex !== -1) {
        this.setData({
          currentChild: state.currentChild,
          currentChildIndex: foundIndex
        });
        
        // 重新加载数据
        this.loadCurrentChildData();
      }
    }
  },

  // 监听全局孩子切换事件
  onChildChanged: function(child, index) {
    // 如果当前页面的孩子状态与全局不一致，则同步
    if (!this.data.currentChild || this.data.currentChild._id !== child._id) {
      this.setData({
        currentChild: child,
        currentChildIndex: index
      });
      
      // 重新加载数据
      this.loadCurrentChildData();
    }
  },

  onPullDownRefresh: function() {
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
    this.setData({ loading: true, error: null });
    
    try {
      await this.loadUserInfo();
      await this.loadChildrenList();
      this.setCurrentDate();
      
      if (this.data.currentChild) {
        await Promise.all([
          this.loadTasks(),
          this.loadRewards()
        ]);
      }
    } catch (error) {
      console.error('加载页面数据失败:', error);
      this.setData({ 
        error: '数据加载失败，请下拉刷新重试' 
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载用户信息
  loadUserInfo: async function() {
    try {
      // 先检查缓存
      const cachedUserInfo = businessDataManager.getUserInfo();
      if (cachedUserInfo) {
        this.setData({ userInfo: cachedUserInfo });
      }

      // 从API获取最新数据
      const result = await userApi.getCurrentUser();
      if (result.code === 0) {
        this.setData({ userInfo: result.data });
        businessDataManager.setUserInfo(result.data);
      } else {
        throw new Error(result.msg || '获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 用户信息失败不影响主要功能，设置默认值
      this.setData({
        userInfo: { nickName: '家长' }
      });
    }
  },

  // 加载孩子列表
  loadChildrenList: async function() {
    try {
      const result = await childrenApi.getList();
      if (result.code === 0) {
        const childrenList = result.data || [];
        
        // 为每个孩子加载基本统计信息
        for (let child of childrenList) {
          try {
            const statsResult = await childrenApi.getStats(child._id);
            if (statsResult.code === 0) {
              child.totalPoints = statsResult.data.totalPoints || 0;
              child.completedTasksToday = statsResult.data.completedTasksToday || 0;
            }
          } catch (error) {
            console.error(`获取孩子 ${child.name} 统计失败:`, error);
            child.totalPoints = 0;
            child.completedTasksToday = 0;
          }
        }
        
        // 使用全局状态管理初始化孩子状态
        const { currentChild, currentChildIndex } = globalChildManager.initChildState(childrenList);
        
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
      throw error;
    }
  },

  
  // 加载任务
  loadTasks: async function() {
    if (!this.data.currentChild) return;
    
    try {
      const result = await tasksApi.getMyTasks(this.data.currentChild._id);
      console.log('getMyTasks result:', result);
      if (result.code === 0) {
        const Tasks = result.data || [];
        this.setData({ Tasks });
      }
    } catch (error) {
      console.error('加载任务失败:', error);
      this.setData({ tasks: [] });
    }
  },

  // 删除任务
  onDeleteTask: async function(e) {
    const taskId = e.detail.taskId;
    try {
      wx.showLoading({ title: '删除中...' });
      const result = await tasksApi.delete(taskId);
      if (result.code === 0) {
        wx.showToast({ title: '删除成功', icon: 'success' });
        this.loadTasks();
      } else {
        throw new Error(result.msg);
      }
    } catch (error) {
      wx.showToast({ title: error.message || '删除失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 编辑任务
  onEditTask: function(e) {
    const taskId = e.detail.taskId;
    wx.navigateTo({
      url: `/pages/tasks/edit?id=${taskId}`
    });
  },

  // 加载奖励数据
  loadRewards: async function() {
    if (!this.data.currentChild) return;
    
    try {
      const result = await rewardsApi.getMyRewards(this.data.currentChild._id);
      if (result.code === 0) {
        const Rewards = result.data || [];
        this.setData({Rewards
        });
      }
    } catch (error) {
      console.error('获取奖励数据失败:', error);
      this.setData({
        Rewards: [],
       
      });
    }
  },

  // 设置当前日期
  setCurrentDate: function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[now.getDay()];
    
    this.setData({
      currentDate: `${year}年${month}月${day}日 星期${weekday}`
    });
  },

  // 检查数据刷新
  checkDataRefresh: function() {
    const now = Date.now();
    const lastRefresh = wx.getStorageSync('lastRefreshTime') || 0;
    
    // 如果超过5分钟，则刷新数据
    if (now - lastRefresh > 300000) {
      this.loadPageData();
      wx.setStorageSync('lastRefreshTime', now);
    }
  },

  // 孩子选择器变化事件
  onChildSelectorChange: function(e) {
    const { index, child, childrenList } = e.detail;
    
    console.log('孩子选择器变化:', child.name, index);
    
    if (index !== this.data.currentChildIndex) {
      this.switchToChild(index);
    }
  },

  // 孩子选择器展开/收起事件
  onChildSelectorToggle: function(e) {
    const { show } = e.detail;
    console.log('孩子选择器', show ? '展开' : '收起');
    
    // 可以在这里添加一些UI反馈，比如调整页面布局等
    // 暂时不需要特殊处理
  },

  // 任务完成
  onTaskComplete: async function(e) {
    const task = e.detail.task;
    
    try {
      wx.showLoading({ title: '完成任务中...' });
      
      const result = await tasksApi.complete(task._id, this.data.currentChild._id);
      if (result.code === 0) {
        wx.showToast({ 
          title: `恭喜！获得${task.points}积分`, 
          icon: 'success' 
        });
        
        // 刷新相关数据
        await Promise.all([
          this.loadTodayTasks(),
          this.loadChildrenList()
        ]);
      } else {
        wx.showToast({ 
          title: result.msg || '完成任务失败', 
          icon: 'none' 
        });
      }
    } catch (error) {
      console.error('完成任务失败:', error);
      wx.showToast({ title: '完成任务失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 奖励点击
  onRewardTap: function(e) {
    const reward = e.currentTarget.dataset.reward;
    const currentPoints = this.data.currentChild.totalPoints || 0;
    
    if (currentPoints < reward.points) {
      wx.showToast({ title: '积分不足', icon: 'none' });
      return;
    }
    
    // 跳转到奖励详情或兑换页面
    wx.navigateTo({
      url: `/pages/rewards/detail?id=${reward._id}`
    });
  },

  // 删除奖励
  onDeleteReward: async function(e) {
    const rewardId = e.detail.rewardId;
    try {
      wx.showLoading({ title: '删除中...' });
      const result = await rewardsApi.delete(rewardId);
      if (result.code === 0) {
        wx.showToast({ title: '删除成功', icon: 'success' });
        this.loadRewards();
      } else {
        throw new Error(result.msg);
      }
    } catch (error) {
      wx.showToast({ title: error.message || '删除失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 编辑奖励
  onEditReward: function(e) {
    const rewardId = e.detail.rewardId;
    wx.navigateTo({
      url: `/pages/rewards/edit?id=${rewardId}`
    });
  },

  // 通知点击
  onNotificationTap: function() {
    wx.navigateTo({
      url: '/pages/notifications/notifications'
    });
  },

  // 添加任务
  onAddTask: function() {
    if (!this.data.currentChild) {
      wx.showToast({ title: '请先添加孩子', icon: 'none' });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/tasks/add?childId=${this.data.currentChild._id}`
    });
  },

  // 添加奖励
  onAddReward: function() {
    wx.navigateTo({
      url: '/pages/rewards/add'
    });
  },

  // 添加孩子
  onAddChild: function() {
    wx.navigateTo({
      url: '/pages/child/addchild'
    });
  },



  // 切换到指定孩子
  switchToChild: function(index) {
    const childrenList = this.data.childrenList;
    
    // 使用全局状态管理切换孩子
    const success = globalChildManager.switchChild(childrenList, index);
    
    if (success) {
      const selectedChild = childrenList[index];
      
      this.setData({
        currentChildIndex: index,
        currentChild: selectedChild
      });

      // 显示切换提示
      wx.showToast({
        title: `已切换到 ${selectedChild.name}`,
        icon: 'success',
        duration: 1500
      });

      // 重新加载当前孩子的数据
      this.loadCurrentChildData();
    } else {
      wx.showToast({
        title: '切换失败',
        icon: 'none'
      });
    }
  },

  // 加载当前孩子的数据
  loadCurrentChildData: async function() {
    if (!this.data.currentChild) return;

    wx.showLoading({ title: '加载中...' });
    
    try {
      await Promise.all([
        this.loadTasks(),
        this.loadRewards()
      ]);
      
      // 更新当前孩子的统计信息
      await this.updateCurrentChildStats();
      
    } catch (error) {
      console.error('加载孩子数据失败:', error);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 更新当前孩子的统计信息
  updateCurrentChildStats: async function() {
    if (!this.data.currentChild) return;

    try {
      const statsResult = await childrenApi.getStats(this.data.currentChild._id);
      if (statsResult.code === 0) {
        const updatedChild = {
          ...this.data.currentChild,
          totalPoints: statsResult.data.totalPoints || 0,
          completedTasksToday: statsResult.data.completedTasksToday || 0
        };

        // 更新当前孩子信息
        this.setData({ currentChild: updatedChild });

        // 同时更新孩子列表中的对应项
        const updatedChildrenList = [...this.data.childrenList];
        updatedChildrenList[this.data.currentChildIndex] = updatedChild;
        this.setData({ childrenList: updatedChildrenList });
      }
    } catch (error) {
      console.error('更新孩子统计信息失败:', error);
    }
  },

  // 导航方法
  navigateToTasks: function() {
    wx.switchTab({
      url: '/pages/tasks/tasks'
    });
  },

  navigateToRewards: function() {
    wx.switchTab({
      url: '/pages/rewards/rewards'
    });
  },

  navigateToAnalysis: function() {
    wx.switchTab({
      url: '/pages/analysis/analysis'
    });
  },

  navigateToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  // 重试
  onRetry: function() {
    this.setData({ error: null });
    this.loadPageData();
  },

  // 分享
  onShareAppMessage: function() {
    return {
      title: 'StarBloom - 智能儿童积分奖励系统',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    };
  }
});