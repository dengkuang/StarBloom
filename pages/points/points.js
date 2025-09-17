// 积分中心页面逻辑
const { childrenApi, pointsApi } = require('../../utils/api-services.js');
const { createPageWithChildManager } = require('../../utils/page-mixins.js');

Page(createPageWithChildManager({
  data: {
    loading: false,
    refreshing: false,
    
    // 当前孩子信息
    currentChild: null,
    currentChildIndex: 0,
    
    // 积分统计
    pointStats: {
      totalPoints: 0,
      totalEarnedPoints: 0,
      totalConsumedPoints: 0,
      todayPoints: 0,
      weekPoints: 0,
      monthPoints: 0,
      tasksCompleted: 0
    },
    
    // 积分记录
    pointRecords: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    
    // 筛选条件
    filterType: 'all', // all, earn, consume, exchange, adjustment
    dateRange: 'all', // all, today, week, month
    
    // 手动调整积分
    showAdjustModal: false,
    adjustType: 'add', // add, subtract
    adjustPoints: 0,
    adjustReason: '',
    
    // 兑换记录
    exchangeRecords: [],
    showExchangeModal: false
  },

  onLoad: function (options) {
    if (options.childId) {
      this.setData({ selectedChildId: options.childId });
    }
  },

  onShow: function () {
    const syncResult = this.syncGlobalChildState();
    if (!syncResult.globalCurrentChild) {
      this.loadPageData();
    } else {
      this.loadChildData();
    }
  },

  onGlobalChildStateChanged: function(child, index) {
    if (child) {
      this.setData({
        currentChild: child,
        currentChildIndex: index
      });
      this.loadChildData();
    }
  },

  onPullDownRefresh: function () {
    this.refreshData().then(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '刷新成功', icon: 'success' });
    }).catch(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '刷新失败', icon: 'none' });
    });
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreRecords();
    }
  },

  // 加载页面数据
  loadPageData: async function() {
    this.setData({ loading: true });
    
    try {
      await this.loadChildrenList();
      if (this.data.currentChild) {
        await Promise.all([
          this.loadPointStats(),
          this.loadPointRecords()
        ]);
      }
    } catch (error) {
      console.error('加载页面数据失败:', error);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载孩子数据
  loadChildData: async function() {
    if (!this.data.currentChild) return;
    
    try {
      await Promise.all([
        this.loadPointStats(),
        this.loadPointRecords()
      ]);
    } catch (error) {
      console.error('加载孩子数据失败:', error);
    }
  },

  // 加载孩子列表
  loadChildrenList: async function() {
    try {
      const result = await childrenApi.getList();
      if (result.code === 0) {
        const childrenList = result.data || [];
        
        if (childrenList.length === 0) {
          this.setData({ 
            childrenList: [],
            currentChild: null,
            currentChildIndex: 0
          });
          return;
        }
        
        this.setGlobalChildrenList(childrenList);
        
        let currentChild = this.getCurrentChild();
        let currentChildIndex = this.getCurrentChildIndex();
        
        if (!currentChild || !childrenList.find(child => child._id === currentChild._id)) {
          currentChild = childrenList[0];
          currentChildIndex = 0;
          this.switchChild(0);
        }
        
        if (this.data.selectedChildId) {
          const foundIndex = childrenList.findIndex(child => child._id === this.data.selectedChildId);
          if (foundIndex !== -1) {
            currentChild = childrenList[foundIndex];
            currentChildIndex = foundIndex;
            this.switchChild(foundIndex);
          }
        }
        
        this.setData({ 
          childrenList,
          currentChild,
          currentChildIndex
        });
      }
    } catch (error) {
      console.error('获取孩子列表失败:', error);
    }
  },

  // 加载积分统计
  loadPointStats: async function() {
    if (!this.data.currentChild) return;
    
    try {
      const result = await pointsApi.getStatistics(this.data.currentChild._id);
      if (result.code === 0) {
        this.setData({
          pointStats: result.data || {}
        });
      }
    } catch (error) {
      console.error('获取积分统计失败:', error);
    }
  },

  // 加载积分记录
  loadPointRecords: async function(reset = false) {
    if (!this.data.currentChild) return;
    
    try {
      const page = reset ? 1 : this.data.page;
      const filters = {
        childId: this.data.currentChild._id
      };
      
      // 应用筛选条件
      if (this.data.filterType !== 'all') {
        if (this.data.filterType === 'earn') {
          filters.changeType = 'earn';
        } else if (this.data.filterType === 'consume') {
          filters.changeType = 'exchange';
        } else if (this.data.filterType === 'adjustment') {
          filters.changeType = ['adjustment_add', 'adjustment_subtract'];
        }
      }
      
      const result = await pointsApi.getHistory(this.data.currentChild._id, filters);
      if (result.code === 0) {
        const records = result.data || [];
        
        if (reset) {
          this.setData({
            pointRecords: records,
            page: 1,
            hasMore: records.length >= this.data.pageSize
          });
        } else {
          this.setData({
            pointRecords: [...this.data.pointRecords, ...records],
            page: page + 1,
            hasMore: records.length >= this.data.pageSize
          });
        }
      }
    } catch (error) {
      console.error('获取积分记录失败:', error);
    }
  },

  // 加载更多记录
  loadMoreRecords: function() {
    this.loadPointRecords(false);
  },

  // 刷新数据
  refreshData: async function() {
    this.setData({ refreshing: true });
    
    try {
      await Promise.all([
        this.loadPointStats(),
        this.loadPointRecords(true)
      ]);
    } catch (error) {
      console.error('刷新数据失败:', error);
      throw error;
    } finally {
      this.setData({ refreshing: false });
    }
  },

  // 切换孩子
  onChildChange: function(e) {
    const index = e.detail.value;
    const childrenList = this.data.childrenList;
    
    if (index >= 0 && index < childrenList.length) {
      const success = this.switchChild(index);
      
      if (success) {
        const currentChild = childrenList[index];
        this.setData({
          currentChildIndex: index,
          currentChild
        });
        
        wx.showToast({
          title: `已切换到 ${currentChild.name}`,
          icon: 'success',
          duration: 1000
        });
        
        this.loadChildData();
      }
    }
  },

  // 筛选类型变化
  onFilterTypeChange: function(e) {
    const filterType = e.currentTarget.dataset.value;
    this.setData({ filterType });
    this.loadPointRecords(true);
  },

  // 显示调整积分弹窗
  showAdjustPointsModal: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      showAdjustModal: true,
      adjustType: type,
      adjustPoints: 0,
      adjustReason: ''
    });
  },

  // 关闭调整积分弹窗
  hideAdjustPointsModal: function() {
    this.setData({
      showAdjustModal: false,
      adjustPoints: 0,
      adjustReason: ''
    });
  },

  // 调整积分数量输入
  onAdjustPointsInput: function(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({ adjustPoints: value });
  },

  // 调整积分原因输入
  onAdjustReasonInput: function(e) {
    this.setData({ adjustReason: e.detail.value });
  },

  // 确认调整积分
  confirmAdjustPoints: async function() {
    const { adjustType, adjustPoints, adjustReason, currentChild } = this.data;
    
    if (adjustPoints <= 0) {
      wx.showToast({ title: '请输入有效的积分数量', icon: 'none' });
      return;
    }
    
    if (!adjustReason.trim()) {
      wx.showToast({ title: '请输入调整原因', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '处理中...' });
    
    try {
      let result;
      if (adjustType === 'add') {
        result = await pointsApi.add(currentChild._id, adjustPoints, adjustReason);
      } else {
        result = await pointsApi.subtract(currentChild._id, adjustPoints, adjustReason);
      }
      
      if (result.code === 0) {
        wx.showToast({ title: adjustType === 'add' ? '积分增加成功' : '积分扣减成功', icon: 'success' });
        this.hideAdjustPointsModal();
        await this.refreshData();
      } else {
        wx.showToast({ title: result.msg || '操作失败', icon: 'none' });
      }
    } catch (error) {
      console.error('调整积分失败:', error);
      wx.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 格式化积分显示
  formatPoints: function(points) {
    if (!points) return '0';
    return points.toString();
  },

  // 格式化日期
  formatDate: function(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (recordDate.getTime() === today.getTime()) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (recordDate.getTime() === yesterday.getTime()) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },

  // 获取积分记录类型文本
  getRecordTypeText: function(record) {
    const typeMap = {
      'earn': '任务奖励',
      'exchange': '奖励兑换',
      'adjustment_add': '手动增加',
      'adjustment_subtract': '手动扣减'
    };
    return typeMap[record.changeType] || '其他';
  },

  // 获取积分记录类型颜色
  getRecordTypeColor: function(record) {
    const colorMap = {
      'earn': 'success',
      'adjustment_add': 'success',
      'exchange': 'error',
      'adjustment_subtract': 'error'
    };
    return colorMap[record.changeType] || 'default';
  },

  // 导航到孩子管理页面
  navigateToChild: function() {
    wx.navigateTo({
      url: '/pages/child/child'
    });
  }
}));