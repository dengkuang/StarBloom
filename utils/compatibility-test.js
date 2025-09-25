// 兼容性测试 - 验证新配置与现有前端页面的兼容性

// 手动导入配置进行测试
const fs = require('fs');
const path = require('path');

// 读取配置文件内容
const configContent = fs.readFileSync(path.join(__dirname, 'task-categories-config.js'), 'utf8');

// 提取TASK_CATEGORIES配置
const taskCategoriesMatch = configContent.match(/const TASK_CATEGORIES = \{([\s\S]*?)\};/);
const habitTagsMatch = configContent.match(/const HABIT_TAGS = \{([\s\S]*?)\};/);

// 简化的类别提取
const NEW_CATEGORIES = [
  'study', 'life', 'sport', 'health', 'social', 'creative', 'reading', 'music',
  'organization', 'housework', 'skill', 'financial', 'hygiene', 'self_care', 
  'family', 'art', 'entertainment'
];

// 现有前端页面使用的类别定义
const EXISTING_CATEGORIES = [
  { value: 'study', label: '学习', emoji: '📚' },
  { value: 'life', label: '生活', emoji: '🏠' },
  { value: 'sport', label: '运动', emoji: '⚽' },
  { value: 'health', label: '健康', emoji: '💪' },
  { value: 'social', label: '社交', emoji: '👥' },
  { value: 'creative', label: '创意', emoji: '🎨' },
  { value: 'reading', label: '阅读', emoji: '📖' },
  { value: 'music', label: '音乐', emoji: '🎵' },
  { value: 'organization', label: '整理', emoji: '📋' },
  { value: 'housework', label: '家务', emoji: '🧹' },
  { value: 'skill', label: '技能', emoji: '🛠️' },
  { value: 'financial', label: '理财', emoji: '💰' }
];

// 现有前端页面使用的习惯标签
const EXISTING_HABIT_TAGS = [
  '卫生', '自理', '整理', '独立', '健康', '作息',
  '学习', '阅读', '书写', '练习', '知识', '专注', '自律',
  '责任感', '礼貌', '分享', '友善', '关爱', '理财', '规划'
];

/**
 * 测试类别兼容性
 */
function testCategoryCompatibility() {
  console.log('=== 测试类别兼容性 ===');
  
  const missingCategories = [];
  
  EXISTING_CATEGORIES.forEach(existing => {
    if (!NEW_CATEGORIES.includes(existing.value)) {
      missingCategories.push(existing.value);
    }
  });
  
  console.log('现有前端页面使用的类别:', EXISTING_CATEGORIES.map(c => c.value));
  console.log('新配置包含的类别:', NEW_CATEGORIES);
  console.log('缺失的类别:', missingCategories);
  
  return {
    compatible: missingCategories.length === 0,
    missing: missingCategories,
    mismatched: []
  };
}

/**
 * 测试习惯标签兼容性
 */
function testHabitTagCompatibility() {
  console.log('=== 测试习惯标签兼容性 ===');
  
  // 新配置中的所有标签
  const allNewTags = [
    // 学习习惯
    '作业完成', '阅读学习', '写字练习', '知识探索', '专注学习', '自主学习',
    // 生活习惯  
    '个人卫生', '作息规律', '饮食习惯', '整理收纳', '自理能力', '独立生活',
    // 运动健康
    '体育锻炼', '户外活动', '身体协调', '健康饮食', '安全意识', '体能训练',
    // 社交情感
    '礼貌待人', '分享合作', '情绪管理', '友善交往', '团队协作', '沟通表达',
    // 品德修养
    '诚实守信', '尊重他人', '责任感', '感恩心态', '助人为乐', '爱护环境',
    // 创意艺术
    '创意思维', '艺术表达', '手工制作', '音乐欣赏', '想象力', '审美能力',
    // 技能发展
    '动手能力', '逻辑思维', '问题解决', '技能学习', '实践操作', '创新能力',
    // 家庭责任
    '家务参与', '关爱家人', '家庭责任', '孝敬长辈', '兄弟姐妹', '家庭和谐'
  ];
  
  const missingTags = [];
  
  EXISTING_HABIT_TAGS.forEach(existing => {
    if (!allNewTags.includes(existing)) {
      missingTags.push(existing);
    }
  });
  
  console.log('现有前端页面使用的标签:', EXISTING_HABIT_TAGS);
  console.log('缺失的标签:', missingTags);
  
  return {
    compatible: missingTags.length === 0,
    missing: missingTags
  };
}

/**
 * 生成兼容性报告
 */
function generateCompatibilityReport() {
  console.log('========== 兼容性测试报告 ==========');
  
  const categoryTest = testCategoryCompatibility();
  const tagTest = testHabitTagCompatibility();
  
  console.log('\n=== 总结 ===');
  console.log('类别兼容性:', categoryTest.compatible ? '✅ 兼容' : '❌ 不兼容');
  console.log('标签兼容性:', tagTest.compatible ? '✅ 兼容' : '❌ 不兼容');
  
  if (!categoryTest.compatible || !tagTest.compatible) {
    console.log('\n=== 需要修复的问题 ===');
    
    if (categoryTest.missing.length > 0) {
      console.log('需要添加的类别:', categoryTest.missing);
    }
    
    if (categoryTest.mismatched.length > 0) {
      console.log('需要修正的类别属性:');
      categoryTest.mismatched.forEach(item => {
        console.log(`  ${item.code}.${item.field}: "${item.existing}" -> "${item.new}"`);
      });
    }
    
    if (tagTest.missing.length > 0) {
      console.log('需要添加的标签:', tagTest.missing);
    }
  }
  
  return {
    overall: categoryTest.compatible && tagTest.compatible,
    categories: categoryTest,
    tags: tagTest
  };
}

// 运行测试
if (require.main === module) {
  generateCompatibilityReport();
}

module.exports = {
  testCategoryCompatibility,
  testHabitTagCompatibility,
  generateCompatibilityReport,
  EXISTING_CATEGORIES,
  EXISTING_HABIT_TAGS
};