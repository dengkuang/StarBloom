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
   * 创建儿童
   */
  async create(data) {
    return await apiClient.callFunction('manageChildren', { action: 'create', data });
  },

  /**
   * 更新儿童信息
   */
  async update(id, data) {
    return await apiClient.callFunction('manageChildren', { action: 'update', id, data });
  },

  /**
   * 删除儿童
   */
  async delete(id) {
    return await apiClient.callFunction('manageChildren', { action: 'delete', id });
  },

  /**
   * 获取儿童统计信息
   */
  async getStats(childId) {
    return await apiClient.callFunction('manageChildren', { action: 'getStats', childId });
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
    return await apiClient.callFunction('manageTasks', { action: 'complete', taskId, childId });
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
  }
};

// 积分管理API
const pointsApi = {
  /**
   * 获取积分历史
   */
  async getHistory(childId, options = {}) {
    return await apiClient.callFunction('managePoints', { action: 'getHistory', childId, ...options });
  },

  /**
   * 获取积分余额
   */
  async getBalance(childId) {
    return await apiClient.callFunction('managePoints', { action: 'getBalance', childId });
  },

  /**
   * 获取积分统计
   */
  async getStatistics(childId) {
    return await apiClient.callFunction('managePoints', { action: 'getStatistics', childId });
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
   * 获取任务模板
   */
  async getTaskTemplates(ageGroup) {
    return await apiClient.callFunction('manageTemplates', { action: 'getTaskTemplates', ageGroup });
  },

  /**
   * 获取奖励模板
   */
  async getRewardTemplates(ageGroup) {
    return await apiClient.callFunction('manageTemplates', { action: 'getRewardTemplates', ageGroup });
  },

  /**
   * 应用模板
   */
  async applyTemplate(data) {
    return await apiClient.callFunction('manageTemplates', { action: 'applyTemplate', data });
  },

  /**
   * 根据年龄段获取模板
   */
  async getByAgeGroup(ageGroup) {
    return await apiClient.callFunction('manageTemplates', { action: 'getByAgeGroup', ageGroup });
  }
};

// 模板管理API（新增）
const templateManagementApi = {
  /**
   * 获取任务模板列表
   */
  async getTaskTemplateList(options = {}) {
    return await apiClient.callFunction('manageTemplateData', { action: 'getTaskTemplateList', ...options });
  },

  /**
   * 获取奖励模板列表
   */
  async getRewardTemplateList(options = {}) {
    return await apiClient.callFunction('manageTemplateData', { action: 'getRewardTemplateList', ...options });
  },

  /**
   * 创建任务模板
   */
  async createTaskTemplate(data) {
    return await apiClient.callFunction('manageTemplateData', { action: 'createTaskTemplate', data });
  },

  /**
   * 更新任务模板
   */
  async updateTaskTemplate(id, data) {
    return await apiClient.callFunction('manageTemplateData', { action: 'updateTaskTemplate', id, data });
  },

  /**
   * 删除任务模板
   */
  async deleteTaskTemplate(id) {
    return await apiClient.callFunction('manageTemplateData', { action: 'deleteTaskTemplate', id });
  },

  /**
   * 创建奖励模板
   */
  async createRewardTemplate(data) {
    return await apiClient.callFunction('manageTemplateData', { action: 'createRewardTemplate', data });
  },

  /**
   * 更新奖励模板
   */
  async updateRewardTemplate(id, data) {
    return await apiClient.callFunction('manageTemplateData', { action: 'updateRewardTemplate', id, data });
  },

  /**
   * 删除奖励模板
   */
  async deleteRewardTemplate(id) {
    return await apiClient.callFunction('manageTemplateData', { action: 'deleteRewardTemplate', id });
  },

  /**
   * 导入模板
   */
  async importTemplates(data) {
    return await apiClient.callFunction('importExportTemplates', { action: 'import', data });
  },

  /**
   * 导出模板
   */
  async exportTemplates(options = {}) {
    return await apiClient.callFunction('importExportTemplates', { action: 'export', ...options });
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
  },

  /**
   * 获取模板导入导出记录
   */
  async getTemplateImportExportRecords() {
    return await apiClient.callFunction('importExportTemplates', { action: 'getRecords' });
  }
};

// 导出所有API服务
module.exports = {
  userApi,
  childrenApi,
  tasksApi,
  rewardsApi,
  pointsApi,
  exchangeApi,
  dictionaryApi,
  templatesApi,
  templateManagementApi
};