// 云环境配置文件
const config = {
  // 开发环境ID，请根据实际情况修改
  env: 'cloud1-2ghnni8r13cb9f60',
  
  // 云函数列表
  functions: [
    'getUserInfo',
    'manageChildren',
    'manageTasks',
    'manageRewards',
    'managePoints',
    'dataAnalysis',
    'manageDictionary',
    'manageTemplates',
    'manageTemplateData',
    'importExportTemplates',
    'initDatabase',
    'initDefaultRewards'
  ]
};

module.exports = config;