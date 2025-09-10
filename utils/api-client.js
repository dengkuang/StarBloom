// API客户端
const cloudInitializer = require('./cloud-init.js');

class ApiClient {
  constructor() {
    this.initialized = false;
  }

  /**
   * 初始化API客户端
   */
  async init() {
    if (this.initialized) {
      return;
    }

    try {
      await cloudInitializer.init();
      this.initialized = true;
      console.log('API客户端初始化成功');
    } catch (err) {
      console.error('API客户端初始化失败:', err);
      throw err;
    }
  }

  /**
   * 调用云函数
   */
  async callFunction(functionName, data = {}) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const result = await cloudInitializer.callFunction({
        name: functionName,
        data: data
      });
      
      return result.result;
    } catch (err) {
      console.error(`调用云函数 ${functionName} 失败:`, err);
      throw err;
    }
  }

  /**
   * 数据库查询
   */
  async databaseQuery(collectionName, queryOptions = {}) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const db = cloudInitializer.database();
      let query = db.collection(collectionName);

      // 应用查询条件
      if (queryOptions.where) {
        query = query.where(queryOptions.where);
      }

      if (queryOptions.orderBy) {
        queryOptions.orderBy.forEach(order => {
          query = query.orderBy(order.field, order.direction);
        });
      }

      if (queryOptions.limit) {
        query = query.limit(queryOptions.limit);
      }

      if (queryOptions.skip) {
        query = query.skip(queryOptions.skip);
      }

      const result = await query.get();
      return result.data;
    } catch (err) {
      console.error(`数据库查询 ${collectionName} 失败:`, err);
      throw err;
    }
  }

  /**
   * 数据库添加记录
   */
  async databaseAdd(collectionName, data) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const db = cloudInitializer.database();
      const result = await db.collection(collectionName).add({
        data: data
      });
      
      return result._id;
    } catch (err) {
      console.error(`数据库添加记录到 ${collectionName} 失败:`, err);
      throw err;
    }
  }

  /**
   * 数据库更新记录
   */
  async databaseUpdate(collectionName, id, data) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const db = cloudInitializer.database();
      const result = await db.collection(collectionName).doc(id).update({
        data: data
      });
      
      return result.stats.updated;
    } catch (err) {
      console.error(`数据库更新记录 ${id} 失败:`, err);
      throw err;
    }
  }

  /**
   * 数据库删除记录
   */
  async databaseRemove(collectionName, id) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const db = cloudInitializer.database();
      const result = await db.collection(collectionName).doc(id).remove();
      
      return result.stats.removed;
    } catch (err) {
      console.error(`数据库删除记录 ${id} 失败:`, err);
      throw err;
    }
  }
}

// 创建单例实例
const apiClient = new ApiClient();

module.exports = apiClient;