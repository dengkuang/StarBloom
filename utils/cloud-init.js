// 云环境初始化工具
const config = require('../cloud/config.js');

class CloudInitializer {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * 初始化云环境
   */
  init() {
    if (this.isInitialized) {
      console.log('云环境已初始化');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (!wx.cloud) {
        const error = '请使用 2.2.3 或以上的基础库以使用云能力';
        console.error(error);
        reject(new Error(error));
        return;
      }

      try {
        wx.cloud.init({
          env: config.env,
          traceUser: true,
        });
        
        this.isInitialized = true;
        console.log('云环境初始化成功');
        resolve();
      } catch (err) {
        console.error('云环境初始化失败:', err);
        reject(err);
      }
    });
  }

  /**
   * 获取数据库实例
   */
  database() {
    if (!this.isInitialized) {
      throw new Error('请先初始化云环境');
    }
    return wx.cloud.database();
  }

  /**
   * 调用云函数
   */
  callFunction(options) {
    if (!this.isInitialized) {
      return Promise.reject(new Error('请先初始化云环境'));
    }
    return wx.cloud.callFunction(options);
  }

  /**
   * 上传文件
   */
  uploadFile(options) {
    if (!this.isInitialized) {
      return Promise.reject(new Error('请先初始化云环境'));
    }
    return wx.cloud.uploadFile(options);
  }

  /**
   * 下载文件
   */
  downloadFile(options) {
    if (!this.isInitialized) {
      return Promise.reject(new Error('请先初始化云环境'));
    }
    return wx.cloud.downloadFile(options);
  }

  /**
   * 获取临时文件URL
   */
  getTempFileURL(options) {
    if (!this.isInitialized) {
      return Promise.reject(new Error('请先初始化云环境'));
    }
    return wx.cloud.getTempFileURL(options);
  }

  /**
   * 删除文件
   */
  deleteFile(options) {
    if (!this.isInitialized) {
      return Promise.reject(new Error('请先初始化云环境'));
    }
    return wx.cloud.deleteFile(options);
  }
}

// 创建单例实例
const cloudInitializer = new CloudInitializer();

module.exports = cloudInitializer;