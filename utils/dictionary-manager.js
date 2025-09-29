// 字典管理器 - 统一管理所有字典数据
const { dictionaryApi } = require('./api-services.js');
const businessDataManager = require('./businessDataManager.js');

class DictionaryManager {
  constructor() {
    this.initialized = false;
    this.initPromise = null;
  }

  /**
   * 初始化字典数据
   */
  async init() {
    if (this.initialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._loadAllDictionaries();
    await this.initPromise;
    this.initialized = true;
  }

  /**
   * 加载所有字典数据
   */
  async _loadAllDictionaries() {
    try {
      const categories = [
        'task_type',
        'reward_type',
        'change_type',
        'task_status',
        'exchange_status',
        'age_group',
        'difficulty',
        'category'
      ];

      // 并行加载所有字典
      const promises = categories.map(category => this._loadDictionary(category));
      await Promise.all(promises);

      console.log('字典数据初始化完成');
    } catch (error) {
      console.error('字典数据初始化失败:', error);
      throw error;
    }
  }

  /**
   * 加载指定分类的字典
   */
  async _loadDictionary(category) {
    try {
      // 先检查缓存
      let data = businessDataManager.getDictionary(category);
      if (data) {
        return data;
      }

      // 从服务器获取
      const result = await dictionaryApi.getByCategory(category);
      if (result.code === 0 && result.data) {
        data = result.data;
        // 缓存数据
        businessDataManager.setDictionary(category, data);
        return data;
      } else {
        console.warn(`获取字典 ${category} 失败:`, result.msg);
        return [];
      }
    } catch (error) {
      console.error(`加载字典 ${category} 失败:`, error);
      return [];
    }
  }

  /**
   * 获取字典数据
   */
  async getDictionary(category) {
    await this.init();
    
    let data = businessDataManager.getDictionary(category);
    if (!data) {
      // 缓存中没有，重新加载
      data = await this._loadDictionary(category);
    }
    return data || [];
  }

  /**
   * 获取奖励类型字典
   */
  async getRewardTypes() {
    return await this.getDictionary('reward_type');
  }

  /**
   * 获取任务类型字典
   */
  async getTaskTypes() {
    return await this.getDictionary('task_type');
  }



  /**
   * 获取任务状态字典
   */
  async getTaskStatuses() {
    return await this.getDictionary('task_status');
  }

  /**
   * 获取兑换状态字典
   */
  async getExchangeStatuses() {
    return await this.getDictionary('exchange_status');
  }

  /**
   * 获取积分变动类型字典
   */
  async getChangeTypes() {
    return await this.getDictionary('change_type');
  }

  /**
   * 根据值获取字典项
   */
  async getDictionaryItem(category, value) {
    const items = await this.getDictionary(category);
    return items.find(item => item.value === value);
  }

  /**
   * 根据代码获取字典项
   */
  async getDictionaryItemByCode(category, code) {
    const items = await this.getDictionary(category);
    return items.find(item => item.code === code);
  }

  /**
   * 获取字典项的显示名称
   */
  async getDictionaryName(category, value) {
    const item = await this.getDictionaryItem(category, value);
    return item ? item.name : value;
  }

  /**
   * 刷新字典缓存
   */
  async refresh(category = null) {
    if (category) {
      // 刷新指定分类
      businessDataManager.delete(`dictionary_${category}`);
      await this._loadDictionary(category);
    } else {
      // 刷新所有字典
      const categories = [
        'task_type', 'reward_type', 'change_type',
        'task_status', 'exchange_status', 'age_group', 'difficulty', 'category'
      ];
      
      categories.forEach(cat => {
        businessDataManager.delete(`dictionary_${cat}`);
      });
      
      await this._loadAllDictionaries();
    }
  }

  /**
   * 格式化奖励类型选项（兼容现有代码）
   */
  async getRewardTypeOptions() {
    const rewardTypes = await this.getRewardTypes();
    return rewardTypes.map(item => ({
      value: item.value,
      label: item.name,
      name: item.name,
      code: item.code
    }));
  }

  /**
   * 格式化任务类型选项（兼容现有代码）
   */
  async getTaskTypeOptions() {
    const taskTypes = await this.getTaskTypes();
    return taskTypes.map(item => ({
      value: item.value,
      label: item.name,
      name: item.name,
      code: item.code
    }));
  }



  /**
   * 验证奖励类型是否有效
   */
  async isValidRewardType(rewardType) {
    const rewardTypes = await this.getRewardTypes();
    return rewardTypes.some(item => item.value === rewardType);
  }

  /**
   * 验证任务类型是否有效
   */
  async isValidTaskType(taskType) {
    const taskTypes = await this.getTaskTypes();
    return taskTypes.some(item => item.value === taskType);
  }

  /**
   * 获取默认奖励类型
   */
  async getDefaultRewardType() {
    const rewardTypes = await this.getRewardTypes();
    return rewardTypes.length > 0 ? rewardTypes[0].value : 'physical';
  }

  /**
   * 获取默认任务类型
   */
  async getDefaultTaskType() {
    const taskTypes = await this.getTaskTypes();
    return taskTypes.length > 0 ? taskTypes[0].value : 'daily';
  }
}

// 创建单例实例
const dictionaryManager = new DictionaryManager();

module.exports = dictionaryManager;