// 模板数据导入脚本
const fs = require('fs');
const path = require('path');

// 导入模板数据到云数据库
async function importTemplates() {
  try {
    console.log('开始导入模板数据...');
    
    // 读取模板文件
    const taskTemplates3_6 = JSON.parse(fs.readFileSync(path.join(__dirname, '../templates/task_templates_3_6_years.json'), 'utf8'));
    const rewardTemplates3_6 = JSON.parse(fs.readFileSync(path.join(__dirname, '../templates/reward_templates_3_6_years.json'), 'utf8'));
    const taskTemplates6_9 = JSON.parse(fs.readFileSync(path.join(__dirname, '../templates/task_templates_6_9_years.json'), 'utf8'));
    const rewardTemplates6_9 = JSON.parse(fs.readFileSync(path.join(__dirname, '../templates/reward_templates_6_9_years.json'), 'utf8'));
    
    console.log(`准备导入数据：
    - 3-6岁任务模板: ${taskTemplates3_6.length} 个
    - 3-6岁奖励模板: ${rewardTemplates3_6.length} 个
    - 6-9岁任务模板: ${taskTemplates6_9.length} 个
    - 6-9岁奖励模板: ${rewardTemplates6_9.length} 个`);
    
    // 为每个模板添加时间戳
    const now = new Date();
    
    const processTemplates = (templates) => {
      return templates.map(template => ({
        ...template,
        createTime: now,
        updateTime: now
      }));
    };
    
    const processedTaskTemplates3_6 = processTemplates(taskTemplates3_6);
    const processedRewardTemplates3_6 = processTemplates(rewardTemplates3_6);
    const processedTaskTemplates6_9 = processTemplates(taskTemplates6_9);
    const processedRewardTemplates6_9 = processTemplates(rewardTemplates6_9);
    
    // 合并所有模板
    const allTaskTemplates = [...processedTaskTemplates3_6, ...processedTaskTemplates6_9];
    const allRewardTemplates = [...processedRewardTemplates3_6, ...processedRewardTemplates6_9];
    
    console.log('模板数据处理完成，准备调用云函数导入...');
    
    // 这里需要调用微信小程序的云函数来导入数据
    // 由于这是一个Node.js脚本，我们需要使用云开发的服务端SDK
    
    return {
      taskTemplates: allTaskTemplates,
      rewardTemplates: allRewardTemplates,
      summary: {
        totalTaskTemplates: allTaskTemplates.length,
        totalRewardTemplates: allRewardTemplates.length,
        taskTemplates3_6: processedTaskTemplates3_6.length,
        rewardTemplates3_6: processedRewardTemplates3_6.length,
        taskTemplates6_9: processedTaskTemplates6_9.length,
        rewardTemplates6_9: processedRewardTemplates6_9.length
      }
    };
    
  } catch (error) {
    console.error('导入模板数据失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  importTemplates()
    .then(result => {
      console.log('模板数据准备完成:', result.summary);
      console.log('请在小程序中调用云函数来完成实际的数据库导入操作');
    })
    .catch(error => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { importTemplates };