# StarBloom 数据库设计文档

## 1. 概述

本文档详细描述了 StarBloom 儿童积分奖励系统的数据库设计，包括核心数据表结构、字段说明、索引设计等。

## 2. 核心数据表结构

### 2.1 users - 用户信息表
```javascript
{
  _id: "string",              // 主键
  openid: "string",           // 微信用户唯一标识
  nickName: "string",         // 用户昵称
  avatarUrl: "string",        // 头像URL
  isAdmin: "boolean",         // 是否管理员
  isAdvancedUser: "boolean",  // 是否高级用户
  createTime: "date",         // 创建时间
  updateTime: "date"          // 更新时间
}
```

### 2.2 children - 儿童信息表
```javascript
{
  _id: "string",              // 主键
  name: "string",             // 儿童姓名
  age: "number",              // 年龄
  avatar: "string",           // 头像URL
  parentId: "string",         // 家长ID (外键 -> users.openid)
  totalPoints: "number",      // 当前总积分
  totalEarnedPoints: "number", // 累计获得积分
  totalConsumedPoints: "number", // 累计消耗积分
  createTime: "date",         // 创建时间
  updateTime: "date"          // 更新时间
}
```

### 2.3 tasks - 任务表
```javascript
{
  _id: "string",              // 主键
  name: "string",             // 任务名称
  description: "string",      // 任务描述
  points: "number",           // 基础积分
  taskType: "string",         // 任务类型：daily/weekly/monthly/once/challenge
  cycleType: "string",        // 任务周期类型：daily/weekly/monthly/custom
  status: "string",           // 状态：active/inactive
  parentId: "string",         // 创建者ID
  childIds: "array",          // 分配的儿童ID列表
  createTime: "date",         // 创建时间
  updateTime: "date"          // 更新时间
}
```
### 2.4 task_示例数据
```
{
  "_id": "77e2f3f368c7d11e00befc1d264864fe",
  "ageGroup": "primary",
  "category": "skill",
  "challengeReward": {
    "description": "额外奖励100积分",
    "points": 100
  },
  "challengeTarget": {
    "description": "一个月内学会一项新技能",
    "weeks": 4
  },
  "childIds": ["3ff6635968c6aace009c11142935777c"],
  "createTime": "Mon Sep 15 2025 16:41:02 GMT+0800 (中国标准时间)",
  "cycleType": "weekly",
  "description": "每周学习一项新技能，如画画、音乐、手工等",
  "difficulty": "hard",
  "habitTags": ["技能", "学习"],
  "name": "学习新技能",
  "parentId": "oAqn65QX6pXo13h007VOJ44raQ1A",
  "points": 25,
  "sourcePackageGroup": "general_boy",
  "sourceTemplateId": "99e7701b68c7b6970430592426930b4b",
  "status": "active",
  "taskType": "weekly",
  "tips": "根据孩子兴趣选择，不要给太大压力"
}
```

### 2.4 task_completion_records - 任务完成记录表
```javascript
{
  _id: "string",              // 主键
  taskId: "string",           // 任务ID
  childId: "string",          // 儿童ID
  completeDate: "date",       // 完成日期
  status: "string",           // 状态
  pointsEarned: "number",     // 获得的积分（冗余字段，便于查询）
  createBy: "string",         // 创建者（家长ID）
  createTime: "date",         // 创建时间
  updateTime: "date"          // 更新时间
}
```

### 2.5 rewards - 奖励表
```javascript
{
  _id: "string",              // 主键
  name: "string",             // 奖励名称
  description: "string",      // 奖励描述
  pointsRequired: "number",   // 所需积分
  rewardType: "string",       // 奖励类型：physical/privilege/experience/virtual/charity/activity/recognition/money
  recommendedStock: "number",            // 库存数量
  status: "string",           // 状态
  parentId: "string",         // 创建者ID
  createTime: "date",         // 创建时间
  updateTime: "date"
  childIds: "array",          // 更新时间
}
```

### 2.6 exchange_records - 兑换记录表
```javascript
{
  _id: "string",              // 主键
  rewardId: "string",         // 奖励ID
  childId: "string",          // 儿童ID
  pointsUsed: "number",       // 使用积分
  exchangeTime: "date",       // 兑换时间
  status: "string",           // 状态：pending/approved/delivered/cancelled
  parentId: "string",         // 家长ID
  _openid: "string",          // 兑换执行者openid
  createTime: "date"          // 创建时间
}
```

### 2.7 point_records - 积分记录表
```javascript
{
  _id: "string",              // 主键
  childId: "string",          // 儿童ID
  points: "number",           // 积分变动 (正数为获得，负数为消耗)
  changeType: "string",       // 变动类型：earn/consume/bonus/adjustment
  reason: "string",           // 变动原因
  sourceType: "string",       // 来源类型：task/exchange/adjustment
  recordTime: "date",         // 记录时间
  createTime: "date",         // 创建时间
  createBy: "string"          // 创建者openid
}
```

### 2.8 task_templates - 任务模板表
```javascript
{
  _id: "string",              // 主键
  templateId: "string",       // 模板唯一标识
  name: "string",             // 任务名称
  description: "string",      // 任务描述
  taskType: "string",         // 任务类型：daily/weekly/monthly/once/challenge
  cycleType: "string",        // 任务周期类型：daily/weekly/monthly/custom
  points: "number",           // 基础积分
  habitTags: "array",         // 习惯标签
  tips: "string",             // 温馨提示
  difficulty: "string",       // 难度等级：easy/medium/hard
  ageGroup: "string",         // 适用年龄段：grade1/grade2/grade3等
  ageRange: "object",         // 具体年龄范围 {min: 6, max: 8}
  category: "string",         // 分类：study/life/exercise/social/family
  challengeTarget: "object",  // 挑战目标配置（如果是挑战类型）
  challengeReward: "object",  // 挑战奖励配置
  isActive: "boolean",        // 是否启用
  sort_order: "number",       // 排序权重
  usage_count: "number",      // 使用次数统计
  version: "number",          // 模板版本号
  createBy: "string",         // 创建者（系统预设为'system'）
  createTime: "date",         // 创建时间
  updateTime: "date"          // 更新时间
}
```

### 2.9 reward_templates - 奖励模板表
```javascript
{
  _id: "string",              // 主键
  templateId: "string",       // 模板唯一标识
  name: "string",             // 奖励名称
  description: "string",      // 奖励描述
  rewardType: "string",       // 奖励类型：physical/privilege/experience/virtual/charity
  pointsRequired: "number",   // 所需积分
  habitTags: "array",         // 相关习惯标签
  ageGroup: "string",         // 适用年龄段：grade1/grade2/grade3等
  ageRange: "object",         // 具体年龄范围 {min: 6, max: 8}
  category: "string",         // 分类：study_supplies/entertainment/experience/virtual
  exchangeRules: "string",    // 兑换规则说明
  recommendedStock: "number", // 推荐库存数量
  imageUrl: "string",         // 模板图片URL
  isActive: "boolean",        // 是否启用
  sort_order: "number",       // 排序权重
  usage_count: "number",      // 使用次数统计
  version: "number",          // 模板版本号
  createBy: "string",         // 创建者（系统预设为'system'）
  createTime: "date",         // 创建时间
  updateTime: "date"          // 更新时间
}
```

### 2.10 dictionaries - 字典表
```javascript
{
  _id: "string",              // 主键
  category: "string",         // 字典分类
  code: "string",             // 字典编码
  name: "string",             // 显示名称
  value: "any",               // 字典值
  is_active: "boolean",       // 是否启用
  create_time: "date",        // 创建时间
  update_time: "date"         // 更新时间
}
```

### 2.11 template_usage_records - 模板使用记录表
```javascript
{
  _id: "string",              // 主键
  templateId: "string",       // 模板ID
  templateType: "string",     // 模板类型：task/reward
  parentId: "string",         // 使用者ID（家长）
  childId: "string",          // 关联儿童ID
  actualItemId: "string",     // 实际创建的任务/奖励ID
  usageType: "string",        // 使用方式：single/batch
  modifications: "object",    // 记录对模板的修改内容
  createTime: "date"          // 使用时间
}
```

### 2.12 template_import_export_records - 模板导入导出记录表
```javascript
{
  _id: "string",              // 主键
  operationType: "string",    // 操作类型：import/export
  fileType: "string",         // 文件类型：excel/csv
  fileName: "string",         // 文件名
  recordCount: "number",      // 记录数量
  operatedBy: "string",       // 操作人ID
  status: "string",           // 状态：success/failed
  errorMsg: "string",         // 错误信息（如果失败）
  createTime: "date"          // 创建时间
}
```

## 3. 数据库索引设计

```javascript
// 主要索引配置（支持模板功能）
const indexes = [
  // children集合
  { collection: 'children', keys: [{ field: 'parentId', direction: 1 }] },
  
  // tasks集合
  { collection: 'tasks', keys: [
    { field: 'parentId', direction: 1 },
    { field: 'childIds', direction: 1 },
    { field: 'status', direction: 1 }
  ]},
  
  // task_completion_records集合
  { collection: 'task_completion_records', keys: [
    { field: 'taskId', direction: 1 },
    { field: 'childId', direction: 1 },
    { field: 'completeDate', direction: -1 }
  ]},
  
  // point_records集合
  { collection: 'point_records', keys: [
    { field: 'childId', direction: 1 },
    { field: 'recordTime', direction: -1 }
  ]},
  
  // rewards集合
  { collection: 'rewards', keys: [
    { field: 'parentId', direction: 1 },
    { field: 'pointsRequired', direction: 1 }
  ]},
  
  // exchange_records集合
  { collection: 'exchange_records', keys: [
    { field: 'childId', direction: 1 },
    { field: 'exchangeTime', direction: -1 }
  ]},
  
  // task_templates集合
  { collection: 'task_templates', keys: [
    { field: 'ageGroup', direction: 1 },
    { field: 'category', direction: 1 },
    { field: 'isActive', direction: 1 },
    { field: 'sort_order', direction: 1 },
    { field: 'createBy', direction: 1 }
  ]},
  
  // reward_templates集合
  { collection: 'reward_templates', keys: [
    { field: 'ageGroup', direction: 1 },
    { field: 'category', direction: 1 },
    { field: 'isActive', direction: 1 },
    { field: 'pointsRequired', direction: 1 },
    { field: 'createBy', direction: 1 }
  ]},
  
  // template_usage_records集合
  { collection: 'template_usage_records', keys: [
    { field: 'parentId', direction: 1 },
    { field: 'templateType', direction: 1 },
    { field: 'createTime', direction: -1 }
  ]},
  
  // template_import_export_records集合
  { collection: 'template_import_export_records', keys: [
    { field: 'operatedBy', direction: 1 },
    { field: 'operationType', direction: 1 },
    { field: 'createTime', direction: -1 }
  ]},
  
  // dictionaries集合
  { collection: 'dictionaries', keys: [
    { field: 'category', direction: 1 },
    { field: 'is_active', direction: 1 }
  ]}
]
```

## 4. 数据初始化策略

### 4.1 字典数据初始化
```javascript
// 任务类型字典 (task_type)
const taskTypeDictionary = [
  { category: 'task_type', code: 'daily', name: '每日任务', value: 'daily' },
  { category: 'task_type', code: 'weekly', name: '每周任务', value: 'weekly' },
  { category: 'task_type', code: 'monthly', name: '每月任务', value: 'monthly' },
  { category: 'task_type', code: 'once', name: '一次性任务', value: 'once' },
  { category: 'task_type', code: 'challenge', name: '挑战任务', value: 'challenge' }
];

// 任务周期类型字典 (cycle_type)
const cycleTypeDictionary = [
  { category: 'cycle_type', code: 'daily', name: '每日', value: 'daily' },
  { category: 'cycle_type', code: 'weekly', name: '每周', value: 'weekly' },
  { category: 'cycle_type', code: 'monthly', name: '每月', value: 'monthly' },
  { category: 'cycle_type', code: 'custom', name: '自定义', value: 'custom' }
];

// 奖励类型字典 (reward_type)
const rewardTypeDictionary = [
  { category: 'reward_type', code: 'physical', name: '实物奖励', value: 'physical' },
  { category: 'reward_type', code: 'privilege', name: '特权奖励', value: 'privilege' },
  { category: 'reward_type', code: 'experience', name: '体验奖励', value: 'experience' },
  { category: 'reward_type', code: 'virtual', name: '虚拟奖励', value: 'virtual' },
  { category: 'reward_type', code: 'charity', name: '公益奖励', value: 'charity' },
  { category: 'reward_type', code: 'activity', name: '活动奖励', value: 'activity' },
  { category: 'reward_type', code: 'recognition', name: '认可奖励', value: 'recognition' },
  { category: 'reward_type', code: 'money', name: '金钱奖励', value: 'money' }
];

// 积分变动类型字典 (change_type)
const changeTypeDictionary = [
  { category: 'change_type', code: 'earn', name: '获得积分', value: 'earn' },
  { category: 'change_type', code: 'consume', name: '消耗积分', value: 'consume' },
  { category: 'change_type', code: 'bonus', name: '奖励积分', value: 'bonus' },
  { category: 'change_type', code: 'daily_bonus', name: '每日奖励', value: 'daily_bonus' },
  { category: 'change_type', code: 'weekly_bonus', name: '每周奖励', value: 'weekly_bonus' },
  { category: 'change_type', code: 'exchange', name: '兑换消耗', value: 'exchange' },
  { category: 'change_type', code: 'adjustment_add', name: '积分调增', value: 'adjustment_add' },
  { category: 'change_type', code: 'adjustment_subtract', name: '积分调减', value: 'adjustment_subtract' }
];

// 任务状态字典 (task_status)
const taskStatusDictionary = [
  { category: 'task_status', code: 'active', name: '激活', value: 'active' },
  { category: 'task_status', code: 'inactive', name: '停用', value: 'inactive' },
  { category: 'task_status', code: 'completed', name: '已完成', value: 'completed' },
  { category: 'task_status', code: 'expired', name: '已过期', value: 'expired' }
];

// 兑换状态字典 (exchange_status)
const exchangeStatusDictionary = [
  { category: 'exchange_status', code: 'pending', name: '待审核', value: 'pending' },
  { category: 'exchange_status', code: 'approved', name: '已批准', value: 'approved' },
  { category: 'exchange_status', code: 'delivered', name: '已发放', value: 'delivered' },
  { category: 'exchange_status', code: 'cancelled', name: '已取消', value: 'cancelled' }
];

// 任务标签字典 (task_tag)
const taskTagDictionary = [
  // 学习类标签
  { category: 'task_tag', code: 'homework', name: '作业完成', value: 'homework' },
  { category: 'task_tag', code: 'reading', name: '阅读学习', value: 'reading' },
  { category: 'task_tag', code: 'writing', name: '写字练习', value: 'writing' },
  { category: 'task_tag', code: 'math', name: '数学练习', value: 'math' },
  { category: 'task_tag', code: 'english', name: '英语学习', value: 'english' },
  { category: 'task_tag', code: 'science', name: '科学探索', value: 'science' },
  
  // 生活习惯类标签
  { category: 'task_tag', code: 'hygiene', name: '个人卫生', value: 'hygiene' },
  { category: 'task_tag', code: 'sleep', name: '作息规律', value: 'sleep' },
  { category: 'task_tag', code: 'eating', name: '饮食习惯', value: 'eating' },
  { category: 'task_tag', code: 'exercise', name: '体育锻炼', value: 'exercise' },
  { category: 'task_tag', code: 'housework', name: '家务劳动', value: 'housework' },
  { category: 'task_tag', code: 'organization', name: '整理收纳', value: 'organization' },
  
  // 品德修养类标签
  { category: 'task_tag', code: 'respect', name: '尊重他人', value: 'respect' },
  { category: 'task_tag', code: 'sharing', name: '分享合作', value: 'sharing' },
  { category: 'task_tag', code: 'honesty', name: '诚实守信', value: 'honesty' },
  { category: 'task_tag', code: 'responsibility', name: '责任担当', value: 'responsibility' },
  { category: 'task_tag', code: 'kindness', name: '善良友爱', value: 'kindness' },
  { category: 'task_tag', code: 'gratitude', name: '感恩感谢', value: 'gratitude' },
  
  // 兴趣爱好类标签
  { category: 'task_tag', code: 'music', name: '音乐艺术', value: 'music' },
  { category: 'task_tag', code: 'art', name: '绘画手工', value: 'art' },
  { category: 'task_tag', code: 'sports', name: '体育运动', value: 'sports' },
  { category: 'task_tag', code: 'nature', name: '自然探索', value: 'nature' },
  { category: 'task_tag', code: 'technology', name: '科技创新', value: 'technology' },
  { category: 'task_tag', code: 'social', name: '社交沟通', value: 'social' },
  
  // 特殊类型标签
  { category: 'task_tag', code: 'challenge', name: '挑战任务', value: 'challenge' },
  { category: 'task_tag', code: 'creative', name: '创意思维', value: 'creative' },
  { category: 'task_tag', code: 'teamwork', name: '团队协作', value: 'teamwork' },
  { category: 'task_tag', code: 'independence', name: '独立自主', value: 'independence' },
  { category: 'task_tag', code: 'persistence', name: '坚持不懈', value: 'persistence' },
  { category: 'task_tag', code: 'safety', name: '安全意识', value: 'safety' }
];
```

### 4.2 模板数据初始化
```javascript
// 模板数据初始化策略
const initTemplateData = {
  // 在系统初始化时导入预设模板
  taskTemplates: grade1TaskTemplates,  // 一年级任务模板
  rewardTemplates: grade1RewardTemplates, // 一年级奖励模板
  
  // 支持扩展其他年龄段
  futureTemplates: [
    'grade2TaskTemplates',  // 二年级
    'grade3TaskTemplates',  // 三年级
    'preschoolTemplates'    // 学前班
  ]
};
```