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
    
    // 管理模式
    isManageMode: false,
    
    // 工具方法
    Math: Math
  },

  onLoad: function () {
    this.loadPageData();
  },

  onShow: function () {
    // 避免频繁刷新，添加防抖
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = setTimeout(() => {
      // 页面显示时检查数据是否需要刷新
      this.checkDataRefresh();
      
      // 同步全局孩子状态
      this.syncGlobalChildState();
    }, 100);
  },

  // 同步全局孩子状态 - 重构版（避免重复调用）
  syncGlobalChildState: function() {
    const state = globalChildManager.getCurrentState();
    
    // 如果全局状态与当前页面状态不一致，则同步
    if (state.currentChild && 
        (!this.data.currentChild || this.data.currentChild._id !== state.currentChild._id)) {
      
      console.log('检测到孩子状态变化，从', this.data.currentChild?.name, '切换到', state.currentChild.name);
      
      // 查找对应的孩子在当前列表中的索引
      const foundIndex = this.data.childrenList.findIndex(child => child._id === state.currentChild._id);
      
      if (foundIndex !== -1) {
        this.setData({
          currentChild: state.currentChild,
          currentChildIndex: foundIndex
        });
        
        // 重新加载数据（强制刷新）
        this.loadCurrentChildData(true);
      }
    } else {
      console.log('孩子状态无变化，跳过同步');
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

  // 加载页面数据 - 重构版（只负责初始化基础数据）
  loadPageData: async function() {
    // 避免并发重复加载
    if (this._pageLoading) {
      console.log('页面基础数据正在加载，跳过重复调用');
      return;
    }
    this._pageLoading = true;

    this.setData({ loading: true, error: null });
    
    try {
      console.log('开始加载页面基础数据...');
      
      // 设置当前日期（不需要异步）
      this.setCurrentDate();
      
      // 并行加载用户信息和孩子列表
      const [userInfoResult, childrenResult] = await Promise.allSettled([
        this.loadUserInfo(),
        this.loadChildrenList()
      ]);
      
      // 处理用户信息加载结果
      if (userInfoResult.status === 'rejected') {
        console.error('用户信息加载失败:', userInfoResult.reason);
        // 用户信息失败不影响主要功能，设置默认值
        this.setData({ userInfo: { nickName: '家长' } });
      }
      
      // 处理孩子列表加载结果
      if (childrenResult.status === 'rejected') {
        console.error('孩子列表加载失败:', childrenResult.reason);
        throw childrenResult.reason;
      }
      
      // 注意：这里不再加载任务和奖励数据，交给 loadCurrentChildData 处理
      console.log('页面基础数据加载完成，当前孩子:', this.data.currentChild?.name);
      
      // 如果有当前孩子，加载孩子相关数据
      if (this.data.currentChild) {
        await this.loadCurrentChildData();
      }
      
    } catch (error) {
      console.error('加载页面数据失败:', error);
      this.setData({ 
        error: '数据加载失败，请下拉刷新重试' 
      });
    } finally {
      this.setData({ loading: false });
      this._pageLoading = false;
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

  // 加载孩子列表 - 优化版
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
      // 保持字段名一致，避免与 show/hide loading 判断不对称
      this.setData({ Tasks: [] });
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

  // 检查数据刷新 - 重构版（避免频繁全量刷新）
  checkDataRefresh: function() {
    const now = Date.now();
    const lastRefresh = wx.getStorageSync('lastRefreshTime') || 0;
    
    // 如果超过5分钟，则刷新数据
    if (now - lastRefresh > 300000) {
      console.log('数据超时，执行刷新');
      
      // 只刷新当前孩子的数据，不重新加载整个页面
      if (this.data.currentChild) {
        this.loadCurrentChildData(true);
      } else {
        // 如果没有当前孩子，才执行全量刷新
        this.loadPageData();
      }
      
      wx.setStorageSync('lastRefreshTime', now);
    } else {
      console.log('数据未超时，跳过刷新');
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
        
        // 刷新相关数据（避免调用不存在的方法，且减少不必要的全量刷新）
        await Promise.all([
          this.loadTasks(),
          this.updateCurrentChildStats()
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
    console.log('点击添加任务按钮');
    console.log('当前孩子:', this.data.currentChild);
    
    if (!this.data.currentChild) {
      wx.showToast({ title: '请先添加孩子', icon: 'none' });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/tasks/add?childId=${this.data.currentChild._id}`,
      success: () => {
        console.log('成功跳转到添加任务页面');
      },
      fail: (error) => {
        console.error('跳转到添加任务页面失败:', error);
        wx.showToast({
          title: '页面跳转失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 添加奖励
  onAddReward: function() {
    console.log('点击添加奖励按钮');
    console.log('当前孩子:', this.data.currentChild);
    
    if (!this.data.currentChild) {
      wx.showToast({ title: '请先添加孩子', icon: 'none' });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/rewards/add?childId=${this.data.currentChild._id}`,
      success: () => {
        console.log('成功跳转到添加奖励页面');
      },
      fail: (error) => {
        console.error('跳转到添加奖励页面失败:', error);
        wx.showToast({
          title: '页面跳转失败，请重试',
          icon: 'none'
        });
      }
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

  // 加载当前孩子的数据 - 重构版（防重复调用）
  loadCurrentChildData: async function(force = false) {
    if (!this.data.currentChild) {
      console.log('没有当前孩子，跳过加载孩子数据');
      return;
    }

    // 防重复调用机制
    const loadingKey = `loading_child_${this.data.currentChild._id}`;
    if (this[loadingKey] && !force) {
      console.log('孩子数据正在加载中，跳过重复调用');
      return;
    }

    this[loadingKey] = true;
    console.log('开始加载孩子数据:', this.data.currentChild.name);

    // 只在首次加载或强制刷新时显示loading（使用局部变量保持对称）
    const shouldShowLoading = force || !this.data.Tasks || this.data.Tasks.length === 0;
    if (shouldShowLoading) {
      wx.showLoading({ title: '加载中...' });
    }
    
    try {
      // 并行加载任务、奖励和统计信息
      const [tasksResult, rewardsResult, statsResult] = await Promise.allSettled([
        this.loadTasks(),
        this.loadRewards(),
        this.updateCurrentChildStats()
      ]);
      
      // 记录加载失败的情况
      if (tasksResult.status === 'rejected') {
        console.error('任务加载失败:', tasksResult.reason);
      }
      if (rewardsResult.status === 'rejected') {
        console.error('奖励加载失败:', rewardsResult.reason);
      }
      if (statsResult.status === 'rejected') {
        console.error('统计信息更新失败:', statsResult.reason);
      }
      
      // 只要有一个成功就不显示错误
      const hasSuccess = [tasksResult, rewardsResult, statsResult].some(
        result => result.status === 'fulfilled'
      );
      
      if (!hasSuccess) {
        wx.showToast({ title: '数据加载失败', icon: 'none' });
      } else {
        console.log('孩子数据加载完成');
      }
      
    } catch (error) {
      console.error('加载孩子数据失败:', error);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    } finally {
      if (shouldShowLoading) {
        wx.hideLoading();
      }
      this[loadingKey] = false;
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

  // 切换管理模式
  onToggleManageMode: function() {
    this.setData({
      isManageMode: !this.data.isManageMode
    });
    
    wx.showToast({
      title: this.data.isManageMode ? '已进入管理模式' : '已退出管理模式',
      icon: 'success',
      duration: 1500
    });
  },

  // 兑换奖励
  onExchangeReward: function(e) {
    const reward = e.detail.reward;
    const currentPoints = this.data.currentChild.totalPoints || 0;
    
    if (currentPoints < reward.pointsRequired) {
      wx.showToast({ title: '积分不足', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '确认兑换',
      content: `确定要兑换"${reward.name}"吗？将消耗${reward.pointsRequired}积分`,
      confirmText: '兑换',
      confirmColor: '#667eea',
      success: (res) => {
        if (res.confirm) {
          // 这里应该调用兑换接口
          wx.showToast({ 
            title: '兑换成功！', 
            icon: 'success' 
          });
          
          // 刷新数据
          this.loadCurrentChildData();
        }
      }
    });
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