// 奖励商店页面逻辑 - 使用API服务层获取真实数据
const { rewardsApi, childrenApi, dictionaryApi, exchangeApi } = require('../../utils/api-services.js');
const { createPageWithChildManager } = require('../../utils/page-mixins.js');

Page(createPageWithChildManager({
  data: {
    rewardList: [],
    loading: false,
    error: null,
    filters: {
      childId: '',
      status: 'active',
      type: ''
    },
    filterOptions: {
      children: [],
      statuses: [
        { name: '全部状态', value: '' },
        { name: '可用', value: 'active' },
        { name: '已下架', value: 'inactive' }
      ],
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
    this.loadRewardList();
  },

  onShow: function () {
    // 同步全局孩子状态
    this.syncGlobalChildState();
    // 页面显示时检查数据是否需要刷新
    this.checkDataRefresh();
  },

  // 全局孩子状态变化回调
  onGlobalChildStateChanged: function(child, index) {
    console.log('奖励页面 - 孩子状态变化:', child ? child.name : '无', index);
    // 当孩子切换时，更新筛选条件并重新加载奖励
    if (child) {
      this.setData({
        'filters.childId': child._id,
        currentPage: 1,
        hasMore: true
      });
      this.loadRewardList();
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

      // 加载类型选项（从字典获取）
      const typeResult = await dictionaryApi.getByCategory('reward_type');
      if (typeResult.code === 0) {
        this.setData({
          'filterOptions.types': typeResult.data
        });
      }
    } catch (error) {
      console.error('加载筛选选项失败:', error);
    }
  },

  loadRewardList: async function() {
    if (this.data.loading) return;

    this.setData({ loading: true, error: null });

    try {
      let result;
      
      // 如果有选中的孩子，使用getMyRewards获取分配给该孩子的奖励
      if (this.data.filters.childId) {
        result = await rewardsApi.getMyRewards(this.data.filters.childId);
      } else {
        // 否则获取所有奖励（管理员视图）
        const queryOptions = {
          ...this.data.filters,
          page: this.data.currentPage,
          limit: this.data.pageSize
        };
        result = await rewardsApi.getList(queryOptions);
      }
      
      if (result.code === 0) {
        const newRewardList = result.data || [];
        
        this.setData({
          rewardList: newRewardList,
          hasMore: false, // getMyRewards返回所有数据，不需要分页
          loading: false
        });

        // 缓存奖励列表
        if (typeof businessDataManager !== 'undefined') {
          businessDataManager.setRewardList(newRewardList);
        }
      } else {
        throw new Error(result.msg || '获取奖励列表失败');
      }
    } catch (error) {
      console.error('获取奖励列表失败:', error);
      this.setData({ 
        loading: false, 
        error: '获取奖励列表失败，请下拉刷新重试' 
      });
      wx.showToast({ title: '获取奖励列表失败', icon: 'none' });
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
      this.loadRewardList();
    }, 300);
  },

  toggleFilterPanel: function() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    });
  },

  onExchangeReward: async function(e) {
    const { reward } = e.detail;
    const currentChild = this.getCurrentChild();
    
    if (!currentChild) {
      wx.showToast({ title: '请先选择儿童', icon: 'none' });
      return;
    }

    // 检查是否可以兑换
    if (!reward.canExchange) {
      if (reward.pointsNeeded > 0) {
        wx.showToast({ title: `积分不足，还需${reward.pointsNeeded}积分`, icon: 'none' });
      } else if (reward.stock <= 0) {
        wx.showToast({ title: '奖励库存不足', icon: 'none' });
      } else {
        wx.showToast({ title: '无法兑换此奖励', icon: 'none' });
      }
      return;
    }

    wx.showModal({
      title: '确认兑换',
      content: `确定要兑换"${reward.name}"吗？需要消耗 ${reward.pointsRequired} 积分`,
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '兑换中...' });
            
           // const result = await rewardsApi.exchange(reward._id, currentChild._id);
            
            if (result.code === 0) {
              wx.showToast({ title: '兑换成功！', icon: 'success' });
              
              // 刷新奖励列表
              this.loadRewardList();
            } else {
              throw new Error(result.msg || '兑换奖励失败');
            }
          } catch (error) {
            console.error('兑换奖励失败:', error);
            wx.showToast({ title: error.message || '兑换奖励失败', icon: 'none' });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  onPullDownRefresh: function() {
    // 下拉刷新
    wx.showNavigationBarLoading();
    this.setData({ currentPage: 1, hasMore: true });
    this.loadRewardList()
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
      this.loadRewardList();
    }
  },

  checkDataRefresh: function() {
    // 检查数据是否需要刷新
    const hasValidCache = businessDataManager.hasValidCache('rewardList');
    
    // 如果缓存过期，则刷新数据
    if (!hasValidCache) {
      this.setData({ currentPage: 1, hasMore: true });
      this.loadRewardList();
    }
  },

  onRetry: function() {
    // 重试加载数据
    this.setData({ error: null, currentPage: 1, hasMore: true });
    this.loadRewardList();
  },

  navigateToAddReward: function() {
    // 跳转到添加奖励页面
    wx.navigateTo({
      url: '/pages/reward-edit/reward-edit'
    });
  },

  onEditReward: function(e) {
    const { reward } = e.detail;
    // 跳转到编辑奖励页面
    wx.navigateTo({
      url: `/pages/reward-edit/reward-edit?id=${reward._id}`
    });
  },

  onDeleteReward: async function(e) {
    const { reward } = e.detail;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除奖励"${reward.name}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await rewardsApi.delete(reward._id);
            if (result.code === 0) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              
              // 刷新奖励列表
              this.setData({ currentPage: 1, hasMore: true });
              this.loadRewardList();
            } else {
              throw new Error(result.msg || '删除奖励失败');
            }
          } catch (error) {
            console.error('删除奖励失败:', error);
            wx.showToast({ title: '删除奖励失败', icon: 'none' });
          }
        }
      }
    });
  },

  onShareAppMessage: function() {
    return {
      title: '奖励商店 - StarBloom',
      path: '/pages/rewards/rewards',
      imageUrl: '/images/share-cover.jpg'
    };
  }
}));