// 奖励系统统一配置文件
// 用于保持前端、后端、数据库的一致性

// 奖励分类配置
export const REWARD_CATEGORIES = {
  // 物质奖励
  toy: {
    code: 'toy',
    name: '玩具',
    emoji: '🧸',
    description: '各种玩具奖励',
    color: '#FF6B6B'
  },
  food: {
    code: 'food', 
    name: '美食',
    emoji: '🍎',
    description: '美食零食奖励',
    color: '#4ECDC4'
  },
  digital: {
    code: 'digital',
    name: '数码',
    emoji: '📱', 
    description: '数码产品奖励',
    color: '#45B7D1'
  },
  book: {
    code: 'book',
    name: '书籍',
    emoji: '📚',
    description: '图书学习资料',
    color: '#96CEB4'
  },
  clothing: {
    code: 'clothing',
    name: '服装',
    emoji: '👕',
    description: '服装配饰奖励',
    color: '#FFEAA7'
  },
  study_supplies: {
    code: 'study_supplies',
    name: '学习用品',
    emoji: '✏️',
    description: '文具学习用品',
    color: '#DDA0DD'
  },
  
  // 体验奖励
  activity: {
    code: 'activity',
    name: '活动',
    emoji: '🎮',
    description: '游戏娱乐活动',
    color: '#74B9FF'
  },
  outing: {
    code: 'outing',
    name: '外出',
    emoji: '🚗',
    description: '外出游玩奖励',
    color: '#00B894'
  },
  experience: {
    code: 'experience',
    name: '体验',
    emoji: '🎪',
    description: '特殊体验奖励',
    color: '#E17055'
  },
  
  // 特权奖励
  privilege: {
    code: 'privilege',
    name: '特权',
    emoji: '👑',
    description: '特殊权限奖励',
    color: '#FDCB6E'
  },
  
  // 其他
  other: {
    code: 'other',
    name: '其他',
    emoji: '🎁',
    description: '其他类型奖励',
    color: '#A29BFE'
  }
};

// 奖励类型配置
export const REWARD_TYPES = {
  physical: {
    code: 'physical',
    name: '实物奖励',
    description: '需要实际发放的物品',
    icon: '📦'
  },
  privilege: {
    code: 'privilege', 
    name: '特权奖励',
    description: '特殊权限或优待',
    icon: '👑'
  },
  experience: {
    code: 'experience',
    name: '体验奖励', 
    description: '活动或体验机会',
    icon: '🎪'
  },
  virtual: {
    code: 'virtual',
    name: '虚拟奖励',
    description: '虚拟物品或积分',
    icon: '💎'
  },
  charity: {
    code: 'charity',
    name: '公益奖励',
    description: '公益活动参与',
    icon: '❤️'
  }
};

// 奖励状态配置
export const REWARD_STATUS = {
  active: {
    code: 'active',
    name: '启用',
    color: '#00B894'
  },
  inactive: {
    code: 'inactive', 
    name: '禁用',
    color: '#DDD'
  },
  out_of_stock: {
    code: 'out_of_stock',
    name: '缺货',
    color: '#E17055'
  }
};

// 获取分类选项数组（用于选择器）
export function getCategoryOptions() {
  return Object.values(REWARD_CATEGORIES).map(category => ({
    value: category.code,
    label: category.name,
    emoji: category.emoji
  }));
}

// 获取奖励类型选项数组
export function getRewardTypeOptions() {
  return Object.values(REWARD_TYPES).map(type => ({
    value: type.code,
    label: type.name,
    icon: type.icon
  }));
}

// 获取状态选项数组
export function getStatusOptions() {
  return Object.values(REWARD_STATUS).map(status => ({
    value: status.code,
    label: status.name,
    color: status.color
  }));
}

// 根据代码获取分类信息
export function getCategoryInfo(code) {
  return REWARD_CATEGORIES[code] || REWARD_CATEGORIES.other;
}

// 根据代码获取奖励类型信息
export function getRewardTypeInfo(code) {
  return REWARD_TYPES[code] || REWARD_TYPES.physical;
}

// 根据代码获取状态信息
export function getStatusInfo(code) {
  return REWARD_STATUS[code] || REWARD_STATUS.active;
}

// 验证分类代码是否有效
export function isValidCategory(code) {
  return code && REWARD_CATEGORIES.hasOwnProperty(code);
}

// 验证奖励类型代码是否有效
export function isValidRewardType(code) {
  return code && REWARD_TYPES.hasOwnProperty(code);
}

// 验证状态代码是否有效
export function isValidStatus(code) {
  return code && REWARD_STATUS.hasOwnProperty(code);
}

// 奖励习惯标签配置（与任务系统保持一致）
export const REWARD_HABIT_TAGS = {
  study: {
    name: '学习习惯',
    tags: ['阅读', '作业', '复习', '预习', '思考', '知识']
  },
  life: {
    name: '生活习惯', 
    tags: ['整理', '卫生', '独立', '自理', '规律', '健康']
  },
  exercise: {
    name: '运动健康',
    tags: ['运动', '锻炼', '健康', '体能', '户外', '活动']
  },
  social: {
    name: '社交情感',
    tags: ['分享', '合作', '友善', '沟通', '情感', '社交']
  },
  creative: {
    name: '创造力',
    tags: ['创意', '艺术', '想象', '创作', '手工', '音乐']
  },
  responsibility: {
    name: '责任感',
    tags: ['责任', '承诺', '坚持', '诚信', '担当', '义务']
  },
  time: {
    name: '时间管理',
    tags: ['时间', '计划', '效率', '准时', '安排', '管理']
  },
  reward: {
    name: '奖励相关',
    tags: ['奖励', '特权', '选择权', '认可', '成就', '激励']
  }
};

// 获取所有习惯标签的扁平数组
export function getAllHabitTags() {
  const allTags = [];
  Object.values(REWARD_HABIT_TAGS).forEach(group => {
    allTags.push(...group.tags);
  });
  return [...new Set(allTags)]; // 去重
}

// 获取习惯标签选项（用于选择器）
export function getHabitTagOptions() {
  return Object.entries(REWARD_HABIT_TAGS).map(([key, group]) => ({
    groupKey: key,
    groupName: group.name,
    tags: group.tags.map(tag => ({
      value: tag,
      label: tag,
      selected: false
    }))
  }));
}

// 年龄组配置
export const AGE_GROUPS = {
  preschool: {
    code: 'preschool',
    name: '学前(3-6岁)',
    minAge: 3,
    maxAge: 6
  },
  primary: {
    code: 'primary', 
    name: '小学(6-12岁)',
    minAge: 6,
    maxAge: 12
  },
  middle: {
    code: 'middle',
    name: '中学(12-18岁)', 
    minAge: 12,
    maxAge: 18
  }
};

// 获取年龄组选项
export function getAgeGroupOptions() {
  return Object.values(AGE_GROUPS).map(group => ({
    value: group.code,
    label: group.name
  }));
}