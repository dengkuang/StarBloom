// 任务类别和习惯标签统一配置文件
// 确保整个项目中类别和标签定义的一致性

/**
 * 任务类别定义
 * 包含类别代码、中文名称、图标和描述
 */
const TASK_CATEGORIES = {
  // 学习类
  study: {
    code: 'study',
    label: '学习',
    emoji: '📚',
    description: '学习相关的任务，如作业、阅读、练习等',
    color: '#4CAF50'
  },
  reading: {
    code: 'reading',
    label: '阅读',
    emoji: '📖',
    description: '阅读相关的任务，如课外阅读、故事书等',
    color: '#FF9800'
  },
  
  // 生活类
  life: {
    code: 'life',
    label: '生活',
    emoji: '🏠',
    description: '日常生活相关的任务',
    color: '#2196F3'
  },
  hygiene: {
    code: 'hygiene',
    label: '卫生',
    emoji: '🧼',
    description: '个人卫生相关的任务，如刷牙、洗脸、洗手等',
    color: '#00BCD4'
  },
  self_care: {
    code: 'self_care',
    label: '自理',
    emoji: '👕',
    description: '自理能力相关的任务，如穿衣、整理等',
    color: '#9C27B0'
  },
  organization: {
    code: 'organization',
    label: '整理',
    emoji: '📋',
    description: '整理收纳相关的任务，如收拾玩具、整理房间等',
    color: '#795548'
  },
  housework: {
    code: 'housework',
    label: '家务',
    emoji: '🧹',
    description: '家务劳动相关的任务，如扫地、洗碗等',
    color: '#607D8B'
  },
  
  // 健康运动类
  health: {
    code: 'health',
    label: '健康',
    emoji: '💪',
    description: '健康相关的任务，如作息、饮食等',
    color: '#4CAF50'
  },
  sport: {
    code: 'sport',
    label: '运动',
    emoji: '⚽',
    description: '体育运动相关的任务',
    color: '#FF5722'
  },
  
  // 社交情感类
  social: {
    code: 'social',
    label: '社交',
    emoji: '👥',
    description: '社交沟通相关的任务',
    color: '#E91E63'
  },
  family: {
    code: 'family',
    label: '家庭',
    emoji: '👨‍👩‍👧‍👦',
    description: '家庭关系相关的任务',
    color: '#FF9800'
  },
  
  // 创意艺术类
  creative: {
    code: 'creative',
    label: '创意',
    emoji: '🎨',
    description: '创意思维相关的任务',
    color: '#9C27B0'
  },
  music: {
    code: 'music',
    label: '音乐',
    emoji: '🎵',
    description: '音乐艺术相关的任务',
    color: '#3F51B5'
  },
  art: {
    code: 'art',
    label: '艺术',
    emoji: '🖌️',
    description: '绘画手工等艺术相关的任务',
    color: '#E91E63'
  },
  
  // 技能发展类
  skill: {
    code: 'skill',
    label: '技能',
    emoji: '🛠️',
    description: '技能学习相关的任务',
    color: '#795548'
  },
  financial: {
    code: 'financial',
    label: '理财',
    emoji: '💰',
    description: '理财意识相关的任务',
    color: '#4CAF50'
  },
  
  // 其他
  entertainment: {
    code: 'entertainment',
    label: '娱乐',
    emoji: '🎪',
    description: '娱乐休闲相关的任务',
    color: '#FF9800'
  }
};

/**
 * 习惯标签定义
 * 按类别组织，便于管理和选择
 */
const HABIT_TAGS = {
  // 基础生活习惯
  life_basic: {
    category: '基础生活',
    tags: ['卫生', '自理', '整理', '独立', '健康', '作息', '饮食', '安全']
  },
  
  // 学习相关
  learning: {
    category: '学习成长',
    tags: ['学习', '阅读', '书写', '练习', '知识', '专注', '自律', '思考', '记忆']
  },
  
  // 品格培养
  character: {
    category: '品格修养',
    tags: ['责任感', '礼貌', '分享', '友善', '关爱', '诚实', '感恩', '尊重', '善良']
  },
  
  // 社交协作
  social: {
    category: '社交协作',
    tags: ['社交', '协作', '友谊', '亲子', '沟通', '团队', '领导力', '同理心']
  },
  
  // 技能发展
  skills: {
    category: '技能发展',
    tags: ['技能', '艺术', '创意', '运动', '音乐', '手工', '科技', '探索']
  },
  
  // 情绪管理
  emotion: {
    category: '情绪管理',
    tags: ['情绪', '耐心', '坚持', '勇气', '自信', '冷静', '乐观', '抗挫']
  },
  
  // 理财规划
  financial: {
    category: '理财规划',
    tags: ['理财', '规划', '储蓄', '消费', '价值观', '目标']
  },
  
  // 特殊类型
  special: {
    category: '特殊类型',
    tags: ['挑战', '创新', '突破', '成就', '里程碑', '季节性']
  }
};

/**
 * 年龄组定义
 */
const AGE_GROUPS = {
  preschool: {
    code: 'preschool',
    label: '学前(3-6岁)',
    minAge: 3,
    maxAge: 6,
    description: '学前儿童，注重基础生活习惯培养'
  },
  primary: {
    code: 'primary',
    label: '小学(6-12岁)',
    minAge: 6,
    maxAge: 12,
    description: '小学阶段，培养学习习惯和基础技能'
  },
  middle: {
    code: 'middle',
    label: '中学(12-15岁)',
    minAge: 12,
    maxAge: 15,
    description: '中学阶段，培养自主学习和责任意识'
  },
  high: {
    code: 'high',
    label: '高中(15-18岁)',
    minAge: 15,
    maxAge: 18,
    description: '高中阶段，培养独立思考和规划能力'
  }
};

/**
 * 任务类型定义
 */
const TASK_TYPES = {
  daily: {
    code: 'daily',
    label: '每日任务',
    description: '每天都需要完成的任务'
  },
  weekly: {
    code: 'weekly',
    label: '每周任务',
    description: '每周完成一次的任务'
  },
  monthly: {
    code: 'monthly',
    label: '每月任务',
    description: '每月完成一次的任务'
  },
  once: {
    code: 'once',
    label: '一次性任务',
    description: '只需要完成一次的任务'
  }
};

/**
 * 难度等级定义
 */
const DIFFICULTY_LEVELS = {
  easy: {
    code: 'easy',
    label: '简单',
    stars: '⭐',
    color: '#4CAF50',
    description: '容易完成的任务'
  },
  medium: {
    code: 'medium',
    label: '中等',
    stars: '⭐⭐',
    color: '#FF9800',
    description: '需要一定努力的任务'
  },
  hard: {
    code: 'hard',
    label: '困难',
    stars: '⭐⭐⭐',
    color: '#F44336',
    description: '需要很大努力的任务'
  }
};

/**
 * 工具函数
 */
const TaskCategoriesUtils = {
  // 获取类别列表（用于选择器）
  getCategoryOptions() {
    return Object.values(TASK_CATEGORIES).map(cat => ({
      value: cat.code,
      label: cat.label,
      emoji: cat.emoji
    }));
  },
  
  // 获取类别信息
  getCategoryInfo(code) {
    return TASK_CATEGORIES[code] || null;
  },
  
  // 获取类别显示文本
  getCategoryText(code) {
    const category = TASK_CATEGORIES[code];
    return category ? category.label : (code || '未分类');
  },
  
  // 获取所有习惯标签（扁平化）
  getAllHabitTags() {
    const allTags = [];
    Object.values(HABIT_TAGS).forEach(group => {
      allTags.push(...group.tags);
    });
    return [...new Set(allTags)]; // 去重
  },
  
  // 获取分组的习惯标签
  getGroupedHabitTags() {
    return HABIT_TAGS;
  },
  
  // 获取年龄组选项
  getAgeGroupOptions() {
    return Object.values(AGE_GROUPS).map(age => ({
      value: age.code,
      label: age.label
    }));
  },
  
  // 获取年龄组显示文本
  getAgeGroupText(code) {
    const ageGroup = AGE_GROUPS[code];
    return ageGroup ? ageGroup.label : (code || '未设置');
  },
  
  // 获取任务类型选项
  getTaskTypeOptions() {
    return Object.values(TASK_TYPES).map(type => ({
      value: type.code,
      label: type.label
    }));
  },
  
  // 获取任务类型显示文本
  getTaskTypeText(code) {
    const taskType = TASK_TYPES[code];
    return taskType ? taskType.label : (code || '未知');
  },
  
  // 获取难度选项
  getDifficultyOptions() {
    return Object.values(DIFFICULTY_LEVELS).map(diff => ({
      value: diff.code,
      label: diff.label,
      stars: diff.stars
    }));
  },
  
  // 获取难度显示文本
  getDifficultyText(code) {
    const difficulty = DIFFICULTY_LEVELS[code];
    return difficulty ? difficulty.label : '未知';
  },
  
  // 获取难度星级
  getDifficultyStars(code) {
    const difficulty = DIFFICULTY_LEVELS[code];
    return difficulty ? difficulty.stars : '⭐';
  }
};

module.exports = {
  TASK_CATEGORIES,
  HABIT_TAGS,
  AGE_GROUPS,
  TASK_TYPES,
  DIFFICULTY_LEVELS,
  TaskCategoriesUtils
};