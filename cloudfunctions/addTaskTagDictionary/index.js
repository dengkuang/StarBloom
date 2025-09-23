const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 任务标签字典数据
const taskTagDictionary = [
  // 学习类标签
  { category: 'task_tag', code: 'homework', name: '作业完成', value: 'homework', is_active: true },
  { category: 'task_tag', code: 'reading', name: '阅读学习', value: 'reading', is_active: true },
  { category: 'task_tag', code: 'writing', name: '写字练习', value: 'writing', is_active: true },
  { category: 'task_tag', code: 'math', name: '数学练习', value: 'math', is_active: true },
  { category: 'task_tag', code: 'english', name: '英语学习', value: 'english', is_active: true },
  { category: 'task_tag', code: 'science', name: '科学探索', value: 'science', is_active: true },
  
  // 生活习惯类标签
  { category: 'task_tag', code: 'hygiene', name: '个人卫生', value: 'hygiene', is_active: true },
  { category: 'task_tag', code: 'sleep', name: '作息规律', value: 'sleep', is_active: true },
  { category: 'task_tag', code: 'eating', name: '饮食习惯', value: 'eating', is_active: true },
  { category: 'task_tag', code: 'exercise', name: '体育锻炼', value: 'exercise', is_active: true },
  { category: 'task_tag', code: 'housework', name: '家务劳动', value: 'housework', is_active: true },
  { category: 'task_tag', code: 'organization', name: '整理收纳', value: 'organization', is_active: true },
  
  // 品德修养类标签
  { category: 'task_tag', code: 'respect', name: '尊重他人', value: 'respect', is_active: true },
  { category: 'task_tag', code: 'sharing', name: '分享合作', value: 'sharing', is_active: true },
  { category: 'task_tag', code: 'honesty', name: '诚实守信', value: 'honesty', is_active: true },
  { category: 'task_tag', code: 'responsibility', name: '责任担当', value: 'responsibility', is_active: true },
  { category: 'task_tag', code: 'kindness', name: '善良友爱', value: 'kindness', is_active: true },
  { category: 'task_tag', code: 'gratitude', name: '感恩感谢', value: 'gratitude', is_active: true },
  
  // 兴趣爱好类标签
  { category: 'task_tag', code: 'music', name: '音乐艺术', value: 'music', is_active: true },
  { category: 'task_tag', code: 'art', name: '绘画手工', value: 'art', is_active: true },
  { category: 'task_tag', code: 'sports', name: '体育运动', value: 'sports', is_active: true },
  { category: 'task_tag', code: 'nature', name: '自然探索', value: 'nature', is_active: true },
  { category: 'task_tag', code: 'technology', name: '科技创新', value: 'technology', is_active: true },
  { category: 'task_tag', code: 'social', name: '社交沟通', value: 'social', is_active: true },
  
  // 特殊类型标签
  { category: 'task_tag', code: 'challenge', name: '挑战任务', value: 'challenge', is_active: true },
  { category: 'task_tag', code: 'creative', name: '创意思维', value: 'creative', is_active: true },
  { category: 'task_tag', code: 'teamwork', name: '团队协作', value: 'teamwork', is_active: true },
  { category: 'task_tag', code: 'independence', name: '独立自主', value: 'independence', is_active: true },
  { category: 'task_tag', code: 'persistence', name: '坚持不懈', value: 'persistence', is_active: true },
  { category: 'task_tag', code: 'safety', name: '安全意识', value: 'safety', is_active: true }
];

exports.main = async (event, context) => {
  try {
    console.log('开始添加任务标签字典数据...');
    
    // 添加时间戳
    const now = new Date();
    const dataWithTimestamp = taskTagDictionary.map(item => ({
      ...item,
      create_time: now,
      update_time: now
    }));
    
    // 批量插入数据
    const result = await db.collection('dictionaries').add({
      data: dataWithTimestamp
    });
    
    console.log('任务标签字典数据添加成功:', result);
    
    return {
      success: true,
      message: '任务标签字典数据添加成功',
      insertedCount: dataWithTimestamp.length,
      data: result
    };
    
  } catch (error) {
    console.error('添加任务标签字典数据失败:', error);
    return {
      success: false,
      message: '添加任务标签字典数据失败',
      error: error.message
    };
  }
};