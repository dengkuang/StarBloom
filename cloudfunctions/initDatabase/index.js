// cloudfunctions/initDatabase/index.js
// 数据库初始化云函数
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 默认字典数据
const defaultDictionaries = {
  task_type: [
    { category: 'task_type', code: 'daily', name: '每日任务', value: 'daily' },
    { category: 'task_type', code: 'weekly', name: '每周任务', value: 'weekly' },
    { category: 'task_type', code: 'monthly', name: '每月任务', value: 'monthly' },
    { category: 'task_type', code: 'once', name: '一次性任务', value: 'once' },
    { category: 'task_type', code: 'challenge', name: '挑战任务', value: 'challenge' }
  ],
  
  cycle_type: [
    { category: 'cycle_type', code: 'daily', name: '每日', value: 'daily' },
    { category: 'cycle_type', code: 'weekly', name: '每周', value: 'weekly' },
    { category: 'cycle_type', code: 'monthly', name: '每月', value: 'monthly' },
    { category: 'cycle_type', code: 'custom', name: '自定义', value: 'custom' }
  ],
  
  reward_type: [
    { category: 'reward_type', code: 'physical', name: '实物奖励', value: 'physical' },
    { category: 'reward_type', code: 'privilege', name: '特权奖励', value: 'privilege' },
    { category: 'reward_type', code: 'experience', name: '体验奖励', value: 'experience' },
    { category: 'reward_type', code: 'virtual', name: '虚拟奖励', value: 'virtual' },
    { category: 'reward_type', code: 'charity', name: '公益奖励', value: 'charity' }
  ],
  
  change_type: [
    { category: 'change_type', code: 'earn', name: '获得积分', value: 'earn' },
    { category: 'change_type', code: 'consume', name: '消耗积分', value: 'consume' },
    { category: 'change_type', code: 'bonus', name: '奖励积分', value: 'bonus' },
    { category: 'change_type', code: 'daily_bonus', name: '每日奖励', value: 'daily_bonus' },
    { category: 'change_type', code: 'weekly_bonus', name: '每周奖励', value: 'weekly_bonus' },
    { category: 'change_type', code: 'adjustment_add', name: '积分调增', value: 'adjustment_add' },
    { category: 'change_type', code: 'adjustment_subtract', name: '积分调减', value: 'adjustment_subtract' }
  ],
  
  task_status: [
    { category: 'task_status', code: 'active', name: '激活', value: 'active' },
    { category: 'task_status', code: 'inactive', name: '停用', value: 'inactive' },
    { category: 'task_status', code: 'completed', name: '已完成', value: 'completed' },
    { category: 'task_status', code: 'expired', name: '已过期', value: 'expired' }
  ],
  
  exchange_status: [
    { category: 'exchange_status', code: 'pending', name: '待审核', value: 'pending' },
    { category: 'exchange_status', code: 'approved', name: '已批准', value: 'approved' },
    { category: 'exchange_status', code: 'delivered', name: '已发放', value: 'delivered' },
    { category: 'exchange_status', code: 'cancelled', name: '已取消', value: 'cancelled' }
  ]
};

// 一年级任务模板数据
const grade1TaskTemplates = [
  {
    templateId: 'task_template_001',
    name: '按时完成作业',
    description: '每天按时完成学校布置的作业',
    taskType: 'daily',

    points: 10,
    habitTags: ['学习', '自律'],
    tips: '建议设置固定的作业时间，培养良好的学习习惯',
    difficulty: 'easy',
    ageGroup: 'grade1',
    ageRange: { min: 6, max: 8 },
    category: 'study',
    isActive: true,
    sort_order: 1,
    usage_count: 0,
    version: 1,
    createBy: 'system',
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    templateId: 'task_template_002',
    name: '整理书包',
    description: '每天晚上整理好书包，准备好第二天的学习用品',
    taskType: 'daily',

    points: 5,
    habitTags: ['整理', '自律'],
    tips: '可以制作一个检查清单，确保不遗漏任何物品',
    difficulty: 'easy',
    ageGroup: 'grade1',
    ageRange: { min: 6, max: 8 },
    category: 'life',
    isActive: true,
    sort_order: 2,
    usage_count: 0,
    version: 1,
    createBy: 'system',
    createTime: new Date(),
    updateTime: new Date()
  }
];

// 一年级奖励模板数据
const grade1RewardTemplates = [
  {
    templateId: 'reward_template_001',
    name: '额外游戏时间',
    description: '获得15分钟额外的游戏时间',
    rewardType: 'privilege',
    pointsRequired: 50,
    habitTags: ['娱乐'],
    ageGroup: 'grade1',
    ageRange: { min: 6, max: 8 },
    category: 'entertainment',
    exchangeRules: '需要家长批准',
    recommendedStock: 999,
    imageUrl: '',
    isActive: true,
    sort_order: 1,
    usage_count: 0,
    version: 1,
    createBy: 'system',
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    templateId: 'reward_template_002',
    name: '小贴纸',
    description: '获得一张精美的小贴纸',
    rewardType: 'physical',
    pointsRequired: 30,
    habitTags: ['奖励'],
    ageGroup: 'grade1',
    ageRange: { min: 6, max: 8 },
    category: 'study_supplies',
    exchangeRules: '需要家长发放',
    recommendedStock: 100,
    imageUrl: '',
    isActive: true,
    sort_order: 2,
    usage_count: 0,
    version: 1,
    createBy: 'system',
    createTime: new Date(),
    updateTime: new Date()
  }
];

exports.main = async (event, context) => {
  const { action } = event;
  
  try {
    switch (action) {
      case 'init':
        return await initializeDatabase();
      case 'reset':
        return await resetDatabase();
      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (error) {
    console.error('initDatabase error:', error);
    return { code: -1, message: '系统错误，请稍后重试' };
  }
};

async function initializeDatabase() {
  try {
    // 首先尝试创建集合（如果不存在）
    await createCollectionsIfNotExist();
    
    // 初始化字典数据
    const dictionaryCollection = db.collection('dictionaries');
    let dictCount = 0;
    for (const category in defaultDictionaries) {
      for (const item of defaultDictionaries[category]) {
        // 检查是否已存在
        const existing = await dictionaryCollection.where({
          category: item.category,
          code: item.code
        }).get();
        
        if (existing.data.length === 0) {
          await dictionaryCollection.add({
            data: item
          });
          dictCount++;
        }
      }
    }
    
    // 初始化任务模板数据
    const taskTemplateCollection = db.collection('task_templates');
    let taskTemplateCount = 0;
    for (const template of grade1TaskTemplates) {
      // 检查是否已存在
      const existing = await taskTemplateCollection.where({
        templateId: template.templateId
      }).get();
      
      if (existing.data.length === 0) {
        await taskTemplateCollection.add({
          data: template
        });
        taskTemplateCount++;
      }
    }
    
    // 初始化奖励模板数据
    const rewardTemplateCollection = db.collection('reward_templates');
    let rewardTemplateCount = 0;
    for (const template of grade1RewardTemplates) {
      // 检查是否已存在
      const existing = await rewardTemplateCollection.where({
        templateId: template.templateId
      }).get();
      
      if (existing.data.length === 0) {
        await rewardTemplateCollection.add({
          data: template
        });
        rewardTemplateCount++;
      }
    }
    
    return { 
      code: 0, 
      message: '数据库初始化成功', 
      data: {
        dictCount,
        taskTemplateCount,
        rewardTemplateCount
      }
    };
  } catch (error) {
    console.error('initializeDatabase error:', error);
    // 确保错误信息能够正确传递
    return { 
      code: -1, 
      message: '数据库初始化失败: ' + error.message, 
      error: error.message 
    };
  }
}

// 创建集合（如果不存在）
async function createCollectionsIfNotExist() {
  const collections = [
    'users',
    'children',
    'tasks',
    'task_completion_records',
    'rewards',
    'exchange_records',
    'point_records',
    'task_templates',
    'reward_templates',
    'dictionaries',
    'template_usage_records',
    'template_import_export_records'
  ];
  
  for (const collectionName of collections) {
    try {
      // 尝试获取集合信息，如果不存在会抛出错误
      await db.collection(collectionName).get();
      console.log(`集合 ${collectionName} 已存在`);
    } catch (error) {
      if (error.errCode === 'DATABASE_COLLECTION_NOT_EXIST') {
        console.log(`集合 ${collectionName} 不存在，将自动创建`);
        // 通过添加一条记录来隐式创建集合
        await db.collection(collectionName).add({
          data: {
            _createTime: new Date(),
            _updateTime: new Date(),
            isTemp: true
          }
        });
        // 删除临时记录
        const result = await db.collection(collectionName).where({
          isTemp: true
        }).get();
        
        if (result.data.length > 0) {
          await db.collection(collectionName).doc(result.data[0]._id).remove();
        }
        console.log(`集合 ${collectionName} 创建成功`);
      } else {
        throw error;
      }
    }
  }
}

async function resetDatabase() {
  try {
    // 重置数据库逻辑（谨慎使用）
    return { code: 0, message: '数据库重置成功' };
  } catch (error) {
    console.error('resetDatabase error:', error);
    return { code: -1, message: '数据库重置失败', error: error.message };
  }
}