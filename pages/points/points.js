// 积分中心页面逻辑

const { childrenApi, pointsApi } = require('../../utils/api-services.js');
const { createPageWithChildManager } = require('../../utils/page-mixins.js');
const { withTaskDataManager } = require('../../utils/task-data-manager.js');

Page(withTaskDataManager(createPageWithChildManager({
  data: {
    loading: false,
    refreshing: false,
    loadingMore: false,
    
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
    total: 0,
    
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
    showExchangeModal: false,
    
    // 防止重复加载标识
    isDataLoaded: false
  },

  onLoad: function (options) {
    if (options.childId) {
      this.setData({ selectedChildId: options.childId });
    }
  },

  onShow: function () {
    console.log('👁️ [DEBUG] 积分记录页面 onShow 触发');
    
    const syncResult = this.syncGlobalChildState();
    console.log('🔍 [DEBUG] syncGlobalChildState 结果:', syncResult);
    console.log('🔍 [DEBUG] isDataLoaded:', this.data.isDataLoaded);
    console.log('🔍 [DEBUG] globalCurrentChild:', syncResult.globalCurrentChild);
    
    // 避免重复加载：只有在数据未加载或全局状态无当前孩子时才加载
    if (!this.data.isDataLoaded || !syncResult.globalCurrentChild) {
      console.log('🔄 [DEBUG] 需要加载页面数据');
      this.loadPageData();
    } else {
      console.log('⏭️ [DEBUG] 跳过页面数据加载');
    }
  },

  onTaskDataUpdated: function(taskList) {
    console.log('🔄 [积分页面] 任务数据已更新，任务数量:', taskList.length);
    // 当任务数据变化时，重新加载积分统计（因为任务完成会影响积分）
    if (this.data.currentChild) {
      this.loadPointStats();
    }
  },

  onGlobalChildStateChanged: function(child, index) {
    console.log('🔄 [DEBUG] onGlobalChildStateChanged 触发');
    console.log('🔍 [DEBUG] 新的child:', child ? {
      _id: child._id,
      name: child.name,
      totalPoints: child.totalPoints,
      totalEarnedPoints: child.totalEarnedPoints,
      totalConsumedPoints: child.totalConsumedPoints
    } : null);
    console.log('🔍 [DEBUG] 新的index:', index);
    console.log('🔍 [DEBUG] 当前currentChild:', this.data.currentChild ? {
      _id: this.data.currentChild._id,
      name: this.data.currentChild.name,
      totalPoints: this.data.currentChild.totalPoints,
      totalEarnedPoints: this.data.currentChild.totalEarnedPoints,
      totalConsumedPoints: this.data.currentChild.totalConsumedPoints
    } : null);
    console.log('🔍 [DEBUG] 当前currentChildIndex:', this.data.currentChildIndex);
    
    if (child) {
      if (!this.data.currentChild || child._id !== this.data.currentChild._id) {
        console.log('✅ [DEBUG] 孩子发生变化，准备更新数据');
        console.log('🔍 [DEBUG] 新孩子的totalPoints:', child.totalPoints);
        
        // 🔧 [修复] 确保 picker 组件的 value 属性正确更新
        // 需要找到新孩子在当前孩子列表中的索引
        let newIndex = index;
        if (this.data.childrenList && this.data.childrenList.length > 0) {
          const foundIndex = this.data.childrenList.findIndex(c => c._id === child._id);
          if (foundIndex !== -1) {
            newIndex = foundIndex;
          }
        }
        
        console.log('🔍 [DEBUG] 计算出的新索引:', newIndex);
        
        this.setData({
          currentChild: child,
          currentChildIndex: newIndex, // 使用计算出的正确索引
          isDataLoaded: false // 重置加载标识
        });
        
        console.log('🔍 [DEBUG] 页面数据已更新，开始加载孩子数据');
        this.loadChildData();
      } else if (child.totalPoints !== this.data.currentChild.totalPoints || 
                 child.totalEarnedPoints !== this.data.currentChild.totalEarnedPoints ||
                 child.totalConsumedPoints !== this.data.currentChild.totalConsumedPoints) {
        console.log('💰 [DEBUG] 积分发生变化，更新显示');
        console.log('🔍 [DEBUG] 积分变化详情:', {
          旧积分: this.data.currentChild.totalPoints,
          新积分: child.totalPoints,
          旧获得积分: this.data.currentChild.totalEarnedPoints,
          新获得积分: child.totalEarnedPoints,
          旧消费积分: this.data.currentChild.totalConsumedPoints,
          新消费积分: child.totalConsumedPoints
        });
        
        // 积分变化，直接更新当前孩子数据和积分统计
        this.setData({
          currentChild: child,
          currentChildIndex: index, // 同时更新索引
          pointStats: {
            ...this.data.pointStats,
            totalPoints: child.totalPoints || 0,
            totalEarnedPoints: child.totalEarnedPoints || 0,
            totalConsumedPoints: child.totalConsumedPoints || 0
          }
        });
        
        // 重新加载积分记录以获取最新数据
        this.loadPointRecords(true);
      } else {
        console.log('⏭️ [DEBUG] 孩子和积分都未变化，跳过重新加载');
        // 即使孩子和积分没变化，也要确保索引正确
        if (index !== this.data.currentChildIndex) {
          console.log('🔧 [DEBUG] 索引不一致，更新索引:', this.data.currentChildIndex, '->', index);
          this.setData({
            currentChildIndex: index
          });
        }
      }
    } else {
      console.log('❌ [DEBUG] 传入的child为空');
      this.setData({
        currentChild: null,
        currentChildIndex: 0,
        pointRecords: [],
        pointStats: {
          totalPoints: 0,
          totalEarnedPoints: 0,
          totalConsumedPoints: 0,
          todayPoints: 0,
          weekPoints: 0,
          monthPoints: 0,
          tasksCompleted: 0
        }
      });
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
    if (this.data.hasMore && !this.data.loading && !this.data.loadingMore) {
      this.loadMoreRecords();
    }
  },

  // 加载页面数据
  loadPageData: async function() {
    if (this.data.loading) return; // 防止重复加载
    
    this.setData({ loading: true });
    
    try {
      await this.loadChildrenList();
      if (this.data.currentChild) {
        await this.loadChildData();
      }
      this.setData({ isDataLoaded: true });
    } catch (error) {
      console.error('加载页面数据失败:', error);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载孩子数据
  loadChildData: async function() {
    console.log('📊 [DEBUG] loadChildData 开始执行');
    console.log('🔍 [DEBUG] currentChild:', this.data.currentChild);
    
    if (!this.data.currentChild) {
      console.log('❌ [DEBUG] currentChild 为空，退出 loadChildData');
      return;
    }
    
    console.log('🔍 [DEBUG] 当前孩子信息:', {
      _id: this.data.currentChild._id,
      name: this.data.currentChild.name,
      totalPoints: this.data.currentChild.totalPoints,
      totalEarnedPoints: this.data.currentChild.totalEarnedPoints,
      totalConsumedPoints: this.data.currentChild.totalConsumedPoints
    });
    
    try {
      // 重置分页状态
      this.setData({
        page: 1,
        hasMore: true,
        pointRecords: []
      });
      
      console.log('🔄 [DEBUG] 开始并行加载积分统计和记录');
      await Promise.all([
        this.loadPointStats(),
        this.loadPointRecords(true) // 重置积分记录列表
      ]);
      console.log('✅ [DEBUG] 孩子数据加载完成');
    } catch (error) {
      console.error('❌ [DEBUG] 加载孩子数据失败:', error);
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
    console.log('🔍 [DEBUG] loadPointStats 开始执行');
    console.log('🔍 [DEBUG] currentChild:', this.data.currentChild);
    
    if (!this.data.currentChild) {
      console.log('❌ [DEBUG] currentChild 为空，退出 loadPointStats');
      return;
    }
    
    const childId = this.data.currentChild._id;
    console.log('🔍 [DEBUG] 准备获取积分统计，childId:', childId);
    console.log('🔍 [DEBUG] currentChild 完整数据:', JSON.stringify(this.data.currentChild, null, 2));
    
    try {
      const result = await pointsApi.getStatistics(childId);
      console.log('🔍 [DEBUG] 积分统计API返回结果:', JSON.stringify(result, null, 2));
      
      if (result.code === 0) {
        console.log('✅ [DEBUG] 积分统计获取成功');
        console.log('🔍 [DEBUG] 统计数据:', JSON.stringify(result.data, null, 2));
        console.log('🔍 [DEBUG] 对比 - 孩子数据中的totalPoints:', this.data.currentChild.totalPoints);
        console.log('🔍 [DEBUG] 对比 - API返回的totalPoints:', result.data?.totalPoints);
        
        this.setData({
          pointStats: result.data || {}
        });
        
        console.log('🔍 [DEBUG] 页面数据已更新，当前pointStats:', this.data.pointStats);
      } else {
        console.log('❌ [DEBUG] 积分统计API返回错误:', result.msg);
      }
    } catch (error) {
      console.error('❌ [DEBUG] 获取积分统计失败:', error);
    }
  },

  // 加载积分记录
  loadPointRecords: async function(reset = false) {
    if (!this.data.currentChild) return;
    
    // 防止重复加载
    if (!reset && (this.data.loadingMore || !this.data.hasMore)) return;
    
    const currentPage = reset ? 1 : this.data.page;
    
    if (!reset) {
      this.setData({ loadingMore: true });
    }
    
    try {
      const filters = {
        childId: this.data.currentChild._id,
        page: currentPage,
        pageSize: this.data.pageSize
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
      console.log('获取积分记录结果:', this.data.currentChild._id, result);
      if (result.code === 0) {
        const responseData = result.data || {};
        const records = responseData.records || responseData || [];
        const total = responseData.total || records.length;
        const hasMore = responseData.hasMore !== undefined ? responseData.hasMore : (records.length >= this.data.pageSize);
        
        // 🔧 临时修复：从积分记录计算总积分
        if (reset && records.length > 0) {
          const calculatedPoints = records.reduce((sum, record) => {
            return sum + (record.points || 0);
          }, 0);
          console.log('🔧 [临时修复] 从记录计算的积分:', calculatedPoints);
          console.log('🔍 [对比] 孩子数据中的积分:', this.data.currentChild.totalPoints);
          
          // 更新积分统计显示
          this.setData({
            pointStats: {
              ...this.data.pointStats,
              totalPoints: calculatedPoints
            }
          });
        }
        
        if (reset) {
          this.setData({
            pointRecords: records,
            page: 1,
            total: total,
            hasMore: hasMore
          });
        } else {
          // 去重处理，避免重复记录
          const existingIds = new Set(this.data.pointRecords.map(record => record._id));
          const newRecords = records.filter(record => !existingIds.has(record._id));
          
          const updatedRecords = [...this.data.pointRecords, ...newRecords];
          
          this.setData({
            pointRecords: updatedRecords,
            page: currentPage + 1,
            hasMore: hasMore && newRecords.length > 0
          });
        }
      }
    } catch (error) {
      console.error('获取积分记录失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      if (!reset) {
        this.setData({ loadingMore: false });
      }
    }
  },

  // 加载更多记录
  loadMoreRecords: function() {
    if (!this.data.loadingMore && this.data.hasMore) {
      this.loadPointRecords(false);
    }
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
    
    console.log('🔄 [DEBUG] 积分页面孩子切换触发');
    console.log('🔍 [DEBUG] 选择的索引:', index);
    console.log('🔍 [DEBUG] 当前索引:', this.data.currentChildIndex);
    
    if (index >= 0 && index < childrenList.length) {
      const selectedChild = childrenList[index];
      console.log('🔍 [DEBUG] 选择的孩子:', selectedChild.name);
      
      // 🔧 [修复] 使用全局状态管理切换孩子，这样会同步到所有页面
      const success = this.switchGlobalChild(childrenList, index);
      
      if (success) {
        console.log('✅ [DEBUG] 全局孩子切换成功');
        
        // 页面状态会通过 onGlobalChildStateChanged 自动更新
        // 这里不需要手动 setData，避免状态不一致
        
        wx.showToast({
          title: `已切换到 ${selectedChild.name}`,
          icon: 'success',
          duration: 1000
        });
      } else {
        console.log('❌ [DEBUG] 全局孩子切换失败');
        wx.showToast({
          title: '切换失败',
          icon: 'none'
        });
      }
    } else {
      console.log('❌ [DEBUG] 无效的索引:', index);
    }
  },

  // 筛选类型变化
  onFilterTypeChange: function(e) {
    const filterType = e.currentTarget.dataset.value;
    if (filterType === this.data.filterType) return; // 避免重复点击
    
    this.setData({ 
      filterType,
      page: 1,
      hasMore: true,
      pointRecords: []
    });
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
})));