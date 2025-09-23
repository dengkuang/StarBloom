// API服务层
const apiClient = require('./api-client.js');

// 用户管理API
const userApi = {
  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    return await apiClient.callFunction('getUserInfo', { action: 'getCurrent' });
  },

  /**
   * 更新用户资料
   */
  async updateProfile(data) {
    return await apiClient.callFunction('getUserInfo', { action: 'update', data });
  },

  /**
   * 用户登录或注册
   */
  async loginOrRegister(userInfo) {
    return await apiClient.callFunction('getUserInfo', { action: 'loginOrRegister', data: userInfo });
  }
};

// 儿童管理API
const childrenApi = {
  /**
   * 获取儿童列表
   */
  async getList() {
    return await apiClient.callFunction('manageChildren', { action: 'list' });
  },

  /**
   * 根据ID获取儿童信息
   */
  async getById(childId) {
    return await apiClient.callFunction('manageChildren', { action: 'getById', data: childId });
  },

  /**
   * 创建儿童
   */
  async create(data) {
    return await apiClient.callFunction('manageChildren', { action: 'create', data });
  },

  /**
   * 更新儿童信息
   */
  async update(data) {
    return await apiClient.callFunction('manageChildren', { action: 'update', data });
  },

  /**
   * 删除儿童
   */
  async delete(childId, forceDelete = false) {
    return await apiClient.callFunction('manageChildren', { 
      action: 'delete', 
      data: { 
        _id: childId,
        forceDelete: forceDelete
      }
    });
  },

  /**
   * 获取儿童统计信息
   */
  async getStats(childId) {
    return await apiClient.callFunction('manageChildren', { action: 'getStats', data: childId });
  }
};

// 任务管理API
const tasksApi = {
  /**
   * 获取任务列表
   */
  async getList(options = {}) {
    return await apiClient.callFunction('manageTasks', { action: 'list', ...options });
  },

  /**
   * 获取分配给自己的任务列表（根据完成状态筛选）
   */
  async getMyTasks(data) {
    return await apiClient.callFunction('manageTasks', { action: 'getMyTasks', data });
  },

  /**
   * 创建任务
   */
  async create(data) {
    return await apiClient.callFunction('manageTasks', { action: 'create', data });
  },

  /**
   * 更新任务
   */
  async update(id, data) {
    return await apiClient.callFunction('manageTasks', { action: 'update', id, data });
  },

  /**
   * 删除任务
   */
  async delete(id) {
    return await apiClient.callFunction('manageTasks', { action: 'delete', id });
  },

  /**
   * 完成任务
   */
  async complete(taskId, childId) {
    return await apiClient.callFunction('manageTasks', { action: 'complete', data: { taskId, childId } });
  }
};

// 奖励管理API
const rewardsApi = {
  /**
   * 获取奖励列表
   */
  async getList(options = {}) {
    return await apiClient.callFunction('manageRewards', { action: 'list', ...options });
  },

  /**
   * 获取分配给指定孩子的奖励列表
   */
  async getMyRewards(data) {
    return await apiClient.callFunction('manageRewards', { action: 'getMyRewards', data });
  },

  /**
   * 创建奖励
   */
  async create(data) {
    return await apiClient.callFunction('manageRewards', { action: 'create', data });
  },

  /**
   * 更新奖励
   */
  async update(id, data) {
    return await apiClient.callFunction('manageRewards', { action: 'update', id, data });
  },

  /**
   * 删除奖励
   */
  async delete(id) {
    return await apiClient.callFunction('manageRewards', { action: 'delete', id });
  },

  /**
   * 兑换奖励
   */
  async exchange(rewardId, childId) {
    return await apiClient.callFunction('manageRewards', { action: 'exchange', data: { rewardId, childId } });
  }
};

// 积分管理API
const pointsApi = {
  /**
   * 获取积分历史
   */
  async getHistory(childId, options = {}) {
    console.log('getHistory:', childId, options);
    return await apiClient.callFunction('managePoints', { 
      action: 'getHistory', 
      data: { 
        childId, 
        ...options 
      } 
    });
  },

  /**
   * 获取积分余额
   */
  async getBalance(childId) {
    return await apiClient.callFunction('managePoints', { action: 'getBalance', data: { childId } });
  },

  /**
   * 获取积分统计
   */
  async getStatistics(childId) {
    return await apiClient.callFunction('managePoints', { action: 'getStatistics', data: { childId } });
  },

  /**
   * 增加积分
   */
  async add(childId, points, reason) {
    return await apiClient.callFunction('managePoints', { action: 'add', data: { childId, points, reason } });
  },

  /**
   * 扣减积分
   */
  async subtract(childId, points, reason) {
    return await apiClient.callFunction('managePoints', { action: 'subtract', data: { childId, points, reason } });
  }
};

// 兑换管理API
const exchangeApi = {
  /**
   * 创建兑换申请
   */
  async createExchange(data) {
    return await apiClient.callFunction('managePoints', { action: 'createExchange', data });
  },

  /**
   * 获取兑换历史
   */
  async getHistory(childId) {
    return await apiClient.callFunction('managePoints', { action: 'getExchangeHistory', childId });
  },

  /**
   * 批准兑换
   */
  async approve(exchangeId) {
    return await apiClient.callFunction('managePoints', { action: 'approveExchange', exchangeId });
  },

  /**
   * 拒绝兑换
   */
  async reject(exchangeId) {
    return await apiClient.callFunction('managePoints', { action: 'rejectExchange', exchangeId });
  }
};

// 字典管理API
const dictionaryApi = {
  /**
   * 根据分类获取字典
   */
  async getByCategory(category) {
    return await apiClient.callFunction('manageDictionary', { action: 'getByCategory', category });
  },

  /**
   * 获取所有字典
   */
  async getAll() {
    return await apiClient.callFunction('manageDictionary', { action: 'getAll' });
  },

  /**
   * 获取所有分类
   */
  async getAllCategories() {
    return await apiClient.callFunction('manageDictionary', { action: 'getAllCategories' });
  },

  /**
   * 批量获取多个分类的字典项
   */
  async batchGet(categories) {
    return await apiClient.callFunction('manageDictionary', { action: 'batchGet', categories });
  },

  /**
   * 添加字典项
   */
  async add(data) {
    return await apiClient.callFunction('manageDictionary', { action: 'add', data });
  },

  /**
   * 更新字典项
   */
  async update(id, data) {
    return await apiClient.callFunction('manageDictionary', { action: 'update', id, data });
  },

  /**
   * 删除字典项
   */
  async delete(id) {
    return await apiClient.callFunction('manageDictionary', { action: 'delete', id });
  },

  /**
   * 刷新字典缓存
   */
  async refresh() {
    return await apiClient.callFunction('manageDictionary', { action: 'refresh' });
  }
};

// 预设模板管理API
const templatesApi = {
  /**
   * 获取任务模板列表
   */
  async getTaskTemplates(options = {}) {
    return await apiClient.callFunction('manageTemplateData', { action: 'list', templateType: 'task', ...options });
  },

  /**
   * 获取奖励模板列表
   */
  async getRewardTemplates(options = {}) {
    return await apiClient.callFunction('manageTemplateData', { action: 'list', templateType: 'reward', ...options });
  },

  /**
   * 获取指定年龄段的任务模板
   */
  async getTaskTemplatesByAge(ageGroup) {
    return await apiClient.callFunction('manageTemplateData', { 
      action: 'list', 
      templateType: 'task',
      ageGroup 
    });
  },

  /**
   * 获取指定年龄段的奖励模板
   */
  async getRewardTemplatesByAge(ageGroup) {
    return await apiClient.callFunction('manageTemplateData', { 
      action: 'list', 
      templateType: 'reward',
      ageGroup 
    });
  },

  /**
   * 应用任务模板到儿童
   */
  async applyTaskTemplate(templateId, childIds, options = {}) {
    return await apiClient.callFunction('manageTemplateData', { 
      action: 'applyTemplate', 
      templateType: 'task',
      templateId,
      childIds,
      ...options
    });
  },

  /**
   * 应用奖励模板到儿童
   */
  async applyRewardTemplate(templateId, childIds, options = {}) {
    return await apiClient.callFunction('manageTemplateData', { 
      action: 'applyTemplate', 
      templateType: 'reward',
      templateId,
      childIds,
      ...options
    });
  },

  /**
   * 批量应用模板到儿童
   */
  async applyBatchTemplates(data) {
    return await apiClient.callFunction('manageTemplateData', { 
      action: 'applyBatchTemplates', 
      data 
    });
  },

  /**
   * 获取模板应用历史
   */
  async getApplicationHistory(childId) {
    return await apiClient.callFunction('manageTemplateData', { 
      action: 'getApplicationHistory', 
      childId 
    });
  },

  /**
   * 获取模板包组列表
   */
  async getPackageGroups(filters = {}) {
    return await apiClient.callFunction('manageTemplateData', { 
      action: 'getPackageGroups', 
      ...filters 
    });
  },

  /**
   * 应用模板包组到儿童
   */
  async applyPackageGroup(packageGroup, childIds, templateType) {
    return await apiClient.callFunction('manageTemplateData', { 
      action: 'applyPackageGroup', 
      data: {
        packageGroup, 
        childIds, 
        templateType 
      }
    });
  },

  /**
   * 更新模板的包组信息
   */
  async updateTemplatePackageGroup(templateId, templateType, packageData) {
    return await apiClient.callFunction('manageTemplateData', { 
      action: 'updateTemplatePackageGroup', 
      data: {
        templateId, 
        templateType, 
        ...packageData 
      }
    });
  },

  /**
   * 创建任务模板
   */
  async createTaskTemplate(data) {
    return await apiClient.callFunction('manageTemplateData', { action: 'create', templateType: 'task', data });
  },

  /**
   * 更新任务模板
   */
  async updateTaskTemplate(id, data) {
    return await apiClient.callFunction('manageTemplateData', { action: 'update', templateType: 'task', id, data });
  },

  /**
   * 删除任务模板
   */
  async deleteTaskTemplate(id) {
    return await apiClient.callFunction('manageTemplateData', { action: 'delete', templateType: 'task', id });
  },

  /**
   * 创建奖励模板
   */
  async createRewardTemplate(data) {
    return await apiClient.callFunction('manageTemplateData', { action: 'create', templateType: 'reward', data });
  },

  /**
   * 更新奖励模板
   */
  async updateRewardTemplate(id, data) {
    return await apiClient.callFunction('manageTemplateData', { action: 'update', templateType: 'reward', id, data });
  },

  /**
   * 删除奖励模板
   */
  async deleteRewardTemplate(id) {
    return await apiClient.callFunction('manageTemplateData', { action: 'delete', templateType: 'reward', id });
  },

  /**
   * 获取模板统计
   */
  async getTemplateStats() {
    return await apiClient.callFunction('manageTemplateData', { action: 'getStats' });
  },

  /**
   * 切换模板状态
   */
  async toggleTemplateStatus(id, isActive) {
    return await apiClient.callFunction('manageTemplateData', { action: 'toggleStatus', id, isActive });
  }
};

// 将模板管理功能整合到 templatesApi 中，移除重复的 API

// 导出所有API服务
module.exports = {
  userApi,
  childrenApi,
  tasksApi,
  rewardsApi,
  pointsApi,
  exchangeApi,
  dictionaryApi,
  templatesApi
};