// scripts/init-database.js
// 数据库初始化脚本

const cloud = require('wx-server-sdk');

// 初始化云环境
cloud.init({
  env: 'your-env-id' // 替换为你的云环境ID
});

const db = cloud.database();

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    // 这里可以添加数据库初始化逻辑
    // 例如创建索引、初始化数据等
    
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

// 执行初始化
initDatabase();