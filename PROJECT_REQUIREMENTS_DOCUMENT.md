# StarBloom 儿童积分奖励系统 - 项目需求文档

## 📋 项目概述

### 项目简介
StarBloom 是一个基于微信小程序的儿童行为激励管理系统，通过积分机制帮助家长培养儿童良好习惯，提供任务管理、积分奖励、数据分析等核心功能。

### 项目特色
- 🎯 **家长主导**：家长创建任务和奖励，引导儿童行为
- 🏆 **积分激励**：完成任务获得积分，积分兑换奖励
- 📊 **数据驱动**：完整的行为数据分析和趋势展示
- 🌈 **双视角**：家长管理视角 + 儿童游戏化视角
- ☁️ **云端同步**：基于微信云开发，数据实时同步

### 技术架构
- **前端**：微信小程序原生框架 (WXML/WXSS/JavaScript)
- **后端**：微信云开发 Serverless 架构
- **数据库**：微信云数据库 (NoSQL)
- **存储**：微信云存储 (图片、文件)
- **主题色**：绿色系 (#4CAF50)
### 界面设计原则
- **设计风格**：童趣、圆角设计
- **品牌元素**：使用“小星星”IP 形象，字体：苹方
### 面向的使用对象
  - **家长**：创建任务、管理儿童、查看数据、积分奖励、给儿童看儿童视图界面
  - **管理员**：可以管理任务模板和奖励模板

## 🗄️ 数据库设计

### 核心数据表

#### 1. users - 用户信息表
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

#### 2. children - 儿童信息表
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

#### 3. tasks - 任务表
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

#### 4. task_completion_records - 任务完成记录表
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

#### 5. rewards - 奖励表
```javascript
{
  _id: "string",              // 主键
  name: "string",             // 奖励名称
  description: "string",      // 奖励描述
  pointsRequired: "number",   // 所需积分
  rewardType: "string",       // 奖励类型：physical/privilege/experience/virtual/charity
  stock: "number",            // 库存数量
  status: "string",           // 状态
  parentId: "string",         // 创建者ID
  createTime: "date",         // 创建时间
  updateTime: "date"          // 更新时间
}
```

#### 6. exchange_records - 兑换记录表
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

#### 7. point_records - 积分记录表
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


#### 9. task_templates - 任务模板表
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

#### 10. dictionaries - 字典表
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

#### 11. reward_templates - 奖励模板表
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

#### 12. template_usage_records - 模板使用记录表
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

#### 13. template_import_export_records - 模板导入导出记录表
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

### 数据库索引设计

```
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
  
  // task_templates集合（新增）
  { collection: 'task_templates', keys: [
    { field: 'ageGroup', direction: 1 },
    { field: 'category', direction: 1 },
    { field: 'isActive', direction: 1 },
    { field: 'sort_order', direction: 1 },
    { field: 'createBy', direction: 1 }
  ]},
  
  // reward_templates集合（新增）
  { collection: 'reward_templates', keys: [
    { field: 'ageGroup', direction: 1 },
    { field: 'category', direction: 1 },
    { field: 'isActive', direction: 1 },
    { field: 'pointsRequired', direction: 1 },
    { field: 'createBy', direction: 1 }
  ]},
  
  // template_usage_records集合（新增）
  { collection: 'template_usage_records', keys: [
    { field: 'parentId', direction: 1 },
    { field: 'templateType', direction: 1 },
    { field: 'createTime', direction: -1 }
  ]},
  
  // template_import_export_records集合（新增）
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

### 模板数据初始化策略

```
// 模板数据初始化脚本
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
}
```
### 字典配置详情

#### 任务类型字典 (task_type)
```javascript
[
  { category: 'task_type', code: 'daily', name: '每日任务', value: 'daily' },
  { category: 'task_type', code: 'weekly', name: '每周任务', value: 'weekly' },
  { category: 'task_type', code: 'monthly', name: '每月任务', value: 'monthly' },
  { category: 'task_type', code: 'once', name: '一次性任务', value: 'once' },
  { category: 'task_type', code: 'challenge', name: '挑战任务', value: 'challenge' }
]
```

#### 任务周期类型字典 (cycle_type)
```javascript
[
  { category: 'cycle_type', code: 'daily', name: '每日', value: 'daily' },
  { category: 'cycle_type', code: 'weekly', name: '每周', value: 'weekly' },
  { category: 'cycle_type', code: 'monthly', name: '每月', value: 'monthly' },
  { category: 'cycle_type', code: 'custom', name: '自定义', value: 'custom' }
]
```

#### 奖励类型字典 (reward_type)
```javascript
[
  { category: 'reward_type', code: 'physical', name: '实物奖励', value: 'physical' },
  { category: 'reward_type', code: 'privilege', name: '特权奖励', value: 'privilege' },
  { category: 'reward_type', code: 'experience', name: '体验奖励', value: 'experience' },
  { category: 'reward_type', code: 'virtual', name: '虚拟奖励', value: 'virtual' },
  { category: 'reward_type', code: 'charity', name: '公益奖励', value: 'charity' }
]
```

#### 积分变动类型字典 (change_type)
```javascript
[
  { category: 'change_type', code: 'earn', name: '获得积分', value: 'earn' },
  { category: 'change_type', code: 'consume', name: '消耗积分', value: 'consume' },
  { category: 'change_type', code: 'bonus', name: '奖励积分', value: 'bonus' },
  { category: 'change_type', code: 'daily_bonus', name: '每日奖励', value: 'daily_bonus' },
  { category: 'change_type', code: 'weekly_bonus', name: '每周奖励', value: 'weekly_bonus' },
  { category: 'change_type', code: 'adjustment_add', name: '积分调增', value: 'adjustment_add' },
  { category: 'change_type', code: 'adjustment_subtract', name: '积分调减', value: 'adjustment_subtract' }
]
```

#### 任务状态字典 (task_status)
```javascript
[
  { category: 'task_status', code: 'active', name: '激活', value: 'active' },
  { category: 'task_status', code: 'inactive', name: '停用', value: 'inactive' },
  { category: 'task_status', code: 'completed', name: '已完成', value: 'completed' },
  { category: 'task_status', code: 'expired', name: '已过期', value: 'expired' }
]
```

#### 兑换状态字典 (exchange_status)
```javascript
[
  { category: 'exchange_status', code: 'pending', name: '待审核', value: 'pending' },
  { category: 'exchange_status', code: 'approved', name: '已批准', value: 'approved' },
  { category: 'exchange_status', code: 'delivered', name: '已发放', value: 'delivered' },
  { category: 'exchange_status', code: 'cancelled', name: '已取消', value: 'cancelled' }
]
```

---

## 🏗️ 系统架构

### 云函数架构
```
cloudfunctions/
├── getUserInfo/         # 用户信息管理
├── manageChildren/      # 儿童信息管理
├── manageTasks/         # 任务管理
├── manageRewards/       # 奖励管理
├── managePoints/        # 积分系统管理
├── dataAnalysis/        # 数据分析
├── manageDictionary/    # 字典管理 (任务类型、周期类型、奖励类型等)
├── manageTemplates/     # 预设模板管理 (一年级、二年级等年龄段模板)
├── manageTemplateData/  # 模板数据管理 (新增：任务模板和奖励模板的增删改查)
├── importExportTemplates/ # 模板导入导出功能 (新增)
├── initDatabase/        # 数据库初始化（包括模板数据导入）
└── initDefaultRewards/  # 默认奖励初始化
```

### API服务层架构
```javascript
// API服务层 (api-services.js)
const apiServices = {
  userApi: {                  // 用户管理API
    getCurrentUser(), updateProfile(), loginOrRegister()
  },
  childrenApi: {              // 儿童管理API
    getList(), create(), update(), delete(), getStats()
  },
  tasksApi: {                 // 任务管理API
    getList(), create(), update(), delete(), complete()
  },
  rewardsApi: {               // 奖励管理API
    getList(), create(), update(), delete()
  },
  pointsApi: {                // 积分管理API
    getHistory(), getBalance(), getStatistics()
  },
  exchangeApi: {              // 兑换管理API
    createExchange(), getHistory(), approve(), reject()
  },
  dictionaryApi: {            // 字典管理API
    getByCategory(), getAll(), add(), update(), delete(), refresh()
  },
  templatesApi: {             // 预设模板管理API
    getTaskTemplates(), getRewardTemplates(), applyTemplate(), getByAgeGroup()
  },
  templateManagementApi: {    // 模板管理API（新增）
    getTaskTemplateList(), getRewardTemplateList(), 
    createTaskTemplate(), updateTaskTemplate(), deleteTaskTemplate(),
    createRewardTemplate(), updateRewardTemplate(), deleteRewardTemplate(),
    importTemplates(), exportTemplates(),
    getTemplateStats(), toggleTemplateStatus(),
    getTemplateImportExportRecords()
  }
}
```

---

## 📱 功能模块设计

### 1. 首页模块 (index)
**路径**: `/pages/index/index`
**功能描述**: 系统入口，用户登录注册，首页概览
- 用户微信授权登录
- 首页数据概览展示
- 快速导航到各功能模块
- 用户状态检查和数据初始化

### 2. 家长管理模块 (parent)
**路径**: `/pages/parent/`
**功能描述**: 家长专用管理功能

#### 2.1 家长控制面板 (`parent.js`)
- 儿童信息管理和切换
- 数据统计概览
- 快速操作入口

#### 2.2 添加儿童 (`addChild.js`)
- 新增儿童信息
- 儿童资料编辑
- 头像上传管理

#### 2.3 添加任务 (`addTask.js`)
- 创建各类型任务
- 任务规则配置
- 挑战任务设计
- **预设模板选择**：
  - 按儿童年龄智能推荐模板
  - 模板分类浏览（学习、生活、运动等）
  - 模板内容预览和应用
  - 一键导入整套年龄段模板
  - 模板基础上的个性化修改

#### 2.4 添加奖励 (`addReward.js`)
- 创建奖励项目
- 奖励类型配置
- 兑换规则设置
- **预设模板选择**：
  - 按奖励类型浏览模板（实物、特权、体验等）
  - 模板积分要求和适用年龄显示
  - 奖励模板快速应用
  - 批量导入年龄段奖励套装

### 3. 儿童视图模块 (child)
**路径**: `/pages/child/child`
**功能描述**: 儿童专用游戏化界面
- 当前积分和任务状态
- 游戏化任务完成界面
- 奖励浏览和选择
- 成就展示和激励

### 4. 任务管理模块 (tasks)
**路径**: `/pages/tasks/tasks`
**功能描述**: 任务的查看、管理和完成
- 任务列表展示和筛选
- 任务完成状态管理
- 任务历史记录查看
- 挑战任务进度追踪

### 5. 奖励商店模块 (rewards)
**路径**: `/pages/rewards/rewards`
**功能描述**: 奖励浏览和兑换
- 奖励商店展示
- 按积分筛选可兑换奖励
- 奖励详情查看
- 兑换申请提交

### 6. 积分中心模块 (points)
**路径**: `/pages/points/points`
**功能描述**: 积分记录和统计
- 积分变动历史
- 积分来源分析
- 收支统计图表
- 数据筛选和搜索

### 7. 数据分析模块 (analysis)
**路径**: `/pages/analysis/analysis`
**功能描述**: 综合数据分析和报告
- 行为习惯分析
- 任务完成趋势
- 积分获得分析
- 成长报告生成

### 8. 设置模块 (settings)
**路径**: `/pages/settings/settings`
**功能描述**: 系统设置和用户偏好
- 用户信息编辑
- 儿童切换管理
- 系统偏好设置
- 数据清理工具
- 字典配置管理：统一管理任务类型、周期类型、奖励类型等字典数据


### 9. 字典配置模块 (dictionary)
**路径**: `/pages/dictionary/` 或集成在设置模块中
**功能描述**: 统一字典数据配置和管理
- 任务类型配置 (daily/weekly/monthly/once/challenge)
- 任务周期类型选项配置
- 奖励类型配置 (physical/privilege/experience/virtual/charity)
- 积分变动类型配置 (earn/consume/bonus/adjustment)
- 任务状态选项配置 (active/inactive/completed)
- 兑换状态选项配置 (pending/approved/delivered/cancelled)
- 自定义标签和分类管理
- 字典项的增删改查功能

### 10. 预设模板模块 (templates)
**路径**: `/pages/templates/` 或集成在添加任务/奖励页面中
**功能描述**: 提供适合不同年龄段儿童的预设任务和奖励模板

#### 10.1 一年级儿童模板 (age6-grade1)
**适用对象**: 6岁上一年级的儿童
**设计理念**: 培养基础学习习惯、生活自理能力和社交技能

##### 预设任务模板
``javascript
const grade1TaskTemplates = [
  // 学习习惯类
  {
    name: "完成今日作业",
    description: "认真完成老师布置的作业，字迹工整",
    taskType: "daily",
    cycleType: "daily",
    points: 3,
    habitTags: ["学习", "专注力"],
    tips: "可以设置固定的作业时间，培养时间观念",
    difficulty: "easy",
    ageRange: { min: 6, max: 8 }
  },
  {
    name: "阅读绘本15分钟",
    description: "每天阅读绘本或儿童读物15分钟",
    taskType: "daily",
    cycleType: "daily",
    points: 2,
    habitTags: ["阅读", "语言发展"],
    tips: "可以和爸爸妈妈一起读，增进亲子关系"
  },
  {
    name: "练习写字10分钟",
    description: "练习写拼音、汉字或数字",
    taskType: "daily",
    cycleType: "daily",
    points: 2,
    habitTags: ["书写", "精细动作"],
    tips: "注意握笔姿势和坐姿"
  },
  
  // 生活自理类
  {
    name: "自己整理书包",
    description: "每天上学前自己整理书包，检查学习用品",
    taskType: "daily",
    cycleType: "daily",
    points: 2,
    habitTags: ["自理", "责任感"],
    tips: "可以制作物品清单，培养条理性"
  },
  {
    name: "自己穿衣洗漱",
    description: "独立完成穿衣、刷牙、洗脸等日常护理",
    taskType: "daily",
    cycleType: "daily",
    points: 1,
    habitTags: ["自理", "卫生习惯"]
  },
  {
    name: "收拾玩具",
    description: "玩完玩具后主动收拾整理",
    taskType: "daily",
    cycleType: "daily",
    points: 1,
    habitTags: ["整理", "责任感"]
  },
  
  // 家庭责任类
  {
    name: "帮忙摆放餐具",
    description: "吃饭前帮助摆放碗筷和餐具",
    taskType: "daily",
    cycleType: "daily",
    points: 1,
    habitTags: ["家务", "责任感"]
  },
  {
    name: "给植物浇水",
    description: "照顾家里的小植物，培养爱心",
    taskType: "weekly",
    cycleType: "weekly",
    points: 3,
    habitTags: ["责任感", "爱心"]
  },
  
  // 运动健康类
  {
    name: "户外活动30分钟",
    description: "每天进行户外运动或游戏",
    taskType: "daily",
    cycleType: "daily",
    points: 2,
    habitTags: ["运动", "健康"]
  },
  {
    name: "学习新的运动技能",
    description: "学会跳绳、拍球等基础运动",
    taskType: "challenge",
    cycleType: "monthly",
    points: 5,
    challengeTarget: { targetCount: 1, timeLimit: "1month" },
    challengeReward: { points: 10, badge: "运动小达人" }
  },
  
  // 社交礼仪类
  {
    name: "主动打招呼",
    description: "见到老师、同学和邻居主动问好",
    taskType: "daily",
    cycleType: "daily",
    points: 1,
    habitTags: ["礼貌", "社交"]
  },
  {
    name: "和同学友好相处",
    description: "在学校与同学友好相处，不打架不骂人",
    taskType: "daily",
    cycleType: "daily",
    points: 2,
    habitTags: ["社交", "品德"]
  },
  
  // 挑战任务类
  {
    name: "一周阅读挑战",
    description: "连续一周每天阅读，培养阅读习惯",
    taskType: "challenge",
    cycleType: "weekly",
    points: 3,
    challengeTarget: { targetCount: 7, timeLimit: "1week" },
    challengeReward: { points: 15, badge: "阅读小博士" }
  },
  {
    name: "自理能力挑战",
    description: "连续一周独立完成穿衣、洗漱、整理书包",
    taskType: "challenge",
    cycleType: "weekly",
    points: 5,
    challengeTarget: { targetCount: 7, timeLimit: "1week" },
    challengeReward: { points: 20, badge: "自理小能手" }
  }
]
```

##### 预设奖励模板
``javascript
const grade1RewardTemplates = [
  // 学习用品类
  {
    name: "新的彩色铅笔",
    description: "一套漂亮的彩色铅笔，用来画画和做作业",
    rewardType: "physical",
    pointsRequired: 15,
    ageRange: { min: 6, max: 8 },
    habitTags: ["学习", "创造力"]
  },
  {
    name: "精美贴纸册",
    description: "收集各种可爱的小贴纸",
    rewardType: "physical",
    pointsRequired: 10,
    habitTags: ["收集", "奖励"]
  },
  {
    name: "新的儿童读物",
    description: "选一本自己喜欢的绘本或故事书",
    rewardType: "physical",
    pointsRequired: 20,
    habitTags: ["阅读", "学习"]
  },
  
  // 特权奖励类
  {
    name: "多看30分钟动画片",
    description: "周末可以额外看30分钟喜欢的动画片",
    rewardType: "privilege",
    pointsRequired: 8,
    exchangeRules: "只能在周末使用，需要家长陪同"
  },
  {
    name: "选择今天的晚餐",
    description: "可以决定今天晚上吃什么（在合理范围内）",
    rewardType: "privilege",
    pointsRequired: 12,
    exchangeRules: "需要选择健康的食物"
  },
  {
    name: "晚睡15分钟",
    description: "今天可以比平时晚睡15分钟",
    rewardType: "privilege",
    pointsRequired: 10,
    exchangeRules: "只能在非上学日使用"
  },
  
  // 体验奖励类
  {
    name: "去公园玩一小时",
    description: "和爸爸妈妈一起去公园玩耍",
    rewardType: "experience",
    pointsRequired: 25,
    exchangeRules: "需要天气良好，家长有时间"
  },
  {
    name: "制作小手工",
    description: "和家长一起制作简单的手工作品",
    rewardType: "experience",
    pointsRequired: 18,
    habitTags: ["创造力", "亲子"]
  },
  {
    name: "去图书馆借书",
    description: "和家长一起去图书馆挑选喜欢的书",
    rewardType: "experience",
    pointsRequired: 15,
    habitTags: ["阅读", "学习"]
  },
  
  // 虚拟奖励类
  {
    name: "小学者勋章",
    description: "认真学习的小学者徽章",
    rewardType: "virtual",
    pointsRequired: 5,
    habitTags: ["学习", "成就"]
  },
  {
    name: "整理小能手称号",
    description: "获得整理小能手的荣誉称号",
    rewardType: "virtual",
    pointsRequired: 8,
    habitTags: ["整理", "自理"]
  },
  
  // 小额奖励类
  {
    name: "小零食",
    description: "选择一样健康的小零食",
    rewardType: "physical",
    pointsRequired: 5,
    exchangeRules: "需要选择健康零食，不能影响正餐"
  },
  {
    name: "和玩偶一起睡觉",
    description: "今晚可以抱着心爱的玩偶一起睡觉",
    rewardType: "privilege",
    pointsRequired: 3
  }
]
```

#### 10.2 模板使用功能
- **快速应用模板**: 在添加任务/奖励时可以选择年龄段模板
- **模板定制**: 可以在模板基础上进行个性化修改
- **批量导入**: 支持一键导入整套年龄段模板
- **模板预览**: 添加前可以预览所有模板内容
- **智能推荐**: 根据儿童年龄自动推荐合适的模板

### 10.3 模板配置（6岁一年级儿童专用）

为了让新手父母快速上手，系统提供一套科学、有趣且适合6岁儿童的配置。每个任务和奖励项都预设了适合年龄，家长在添加时可以方便地从预设的任务和奖励库中选择添加，也可以成套应用。

#### 10.3.1 积分奖励任务（每日任务）

| 任务名称 | 积分值 | 说明/小贴士 |
|---------|--------|------------|
| 按时起床（7:30前） | 1颗星 | "小闹钟一响，立刻坐起来，不赖床！" |
| 自己刷牙洗脸 | 1颗星 | "上下刷，里外刷，牙齿白白笑哈哈！" |
| 整理书包（为明天） | 2颗星 | "课本、文具都回家，书包整整齐齐！" |
| 完成作业（独立完成） | 2颗星 | "认真写，不拖拉，做完自己检查！" |
| 自己收拾玩具 | 1颗星 | "玩具宝宝要回家，送它们回'房子'！" |
| 吃完饭帮忙收碗筷 | 1颗星 | "小帮手真能干，妈妈谢谢你！" |
| 说'请'、'谢谢'、'对不起' | 1颗星/次 | "礼貌用语像魔法，让人听了笑开花！"（每日上限3颗星） |
| 睡前阅读20分钟 | 2颗星 | "和爸爸妈妈一起看书，故事时间最美好！" |

#### 10.3.2 额外奖励任务

| 任务名称 | 积分值 | 任务类型 | 说明 |
|---------|--------|----------|------|
| 本周之星 | 5颗星 | 每周奖励 | 如果一周内所有每日任务完成率≥90% |
| 超级挑战 | 10颗星 | 挑战任务 | 连续7天独立完成作业 |

#### 10.3.3 默认积分兑换物品（兑换商店）

| 奖品名称 | 所需积分 | 奖品类型 | 说明 |
|---------|---------|----------|------|
| 一本新绘本 | 15颗星 | 实物 | "选一本你最喜欢的书！" |
| 小汽车玩具 | 25颗星 | 实物 | "酷酷的小车，开动啦！" |
| 多看30分钟动画片 | 10颗星 | 特权 | "周末可以多看半小时哦！" |
| 决定周末家庭活动 | 30颗星 | 特权 | "去公园？看电影？你说了算！" |
| 和爸爸/妈妈一起打游戏30分钟 | 15颗星 | 体验 | "专属亲子游戏时间！" |
| 去吃一次冰淇淋 | 20颗星 | 体验 | "选你喜欢的口味！" |
| "小帮手"勋章（电子版） | 5颗星 | 虚拟 | "佩戴在个人主页，闪闪发光！" |
| 为流浪小猫捐一顿猫粮 | 15颗星 | 慈善 | "爱心小天使，帮助小动物！" |

#### 10.3.4 默认模板数据库结构

```
// 为6岁一年级儿童预设的默认任务模板
const defaultGrade1TaskTemplates = [
  {
    name: "按时起床（7:30前）",
    description: "小闹钟一响，立刻坐起来，不赖床！",
    taskType: "daily",
    cycleType: "daily",
    points: 1,
    habitTags: ["作息", "自律"],
    tips: "小闹钟一响，立刻坐起来，不赖床！",
    difficulty: "easy",
    ageRange: { min: 6, max: 7 },
    category: "life"
  },
  {
    name: "自己刷牙洗脸",
    description: "上下刷，里外刷，牙齿白白笑哈哈！",
    taskType: "daily",
    cycleType: "daily",
    points: 1,
    habitTags: ["卫生", "自理"],
    tips: "上下刷，里外刷，牙齿白白笑哈哈！",
    difficulty: "easy",
    ageRange: { min: 6, max: 7 },
    category: "life"
  },
  {
    name: "整理书包（为明天）",
    description: "课本、文具都回家，书包整整齐齐！",
    taskType: "daily",
    cycleType: "daily",
    points: 2,
    habitTags: ["学习", "整理"],
    tips: "课本、文具都回家，书包整整齐齐！",
    difficulty: "medium",
    ageRange: { min: 6, max: 7 },
    category: "study"
  },
  {
    name: "完成作业（独立完成）",
    description: "认真写，不拖拉，做完自己检查！",
    taskType: "daily",
    cycleType: "daily",
    points: 2,
    habitTags: ["学习", "专注力"],
    tips: "认真写，不拖拉，做完自己检查！",
    difficulty: "medium",
    ageRange: { min: 6, max: 7 },
    category: "study"
  },
  {
    name: "自己收拾玩具",
    description: "玩具宝宝要回家，送它们回'房子'！",
    taskType: "daily",
    cycleType: "daily",
    points: 1,
    habitTags: ["整理", "责任感"],
    tips: "玩具宝宝要回家，送它们回'房子'！",
    difficulty: "easy",
    ageRange: { min: 6, max: 7 },
    category: "life"
  },
  {
    name: "吃完饭帮忙收碗筷",
    description: "小帮手真能干，妈妈谢谢你！",
    taskType: "daily",
    cycleType: "daily",
    points: 1,
    habitTags: ["家务", "责任感"],
    tips: "小帮手真能干，妈妈谢谢你！",
    difficulty: "easy",
    ageRange: { min: 6, max: 7 },
    category: "family"
  },
  {
    name: "说'请'、'谢谢'、'对不起'",
    description: "礼貌用语像魔法，让人听了笑开花！（每日上限3颗星）",
    taskType: "daily",
    cycleType: "daily",
    points: 1,
    habitTags: ["礼貌", "社交"],
    tips: "礼貌用语像魔法，让人听了笑开花！",
    difficulty: "easy",
    ageRange: { min: 6, max: 7 },
    category: "social",
    dailyLimit: 3
  },
  {
    name: "睡前阅读20分钟",
    description: "和爸爸妈妈一起看书，故事时间最美好！",
    taskType: "daily",
    cycleType: "daily",
    points: 2,
    habitTags: ["阅读", "学习"],
    tips: "和爸爸妈妈一起看书，故事时间最美好！",
    difficulty: "medium",
    ageRange: { min: 6, max: 7 },
    category: "study"
  },
  // 每周奖励任务
  {
    name: "本周之星",
    description: "如果一周内所有每日任务完成率≥90%",
    taskType: "weekly",
    cycleType: "weekly",
    points: 5,
    habitTags: ["综合", "奖励"],
    tips: "坚持一周，你就是本周之星！",
    difficulty: "easy",
    ageRange: { min: 6, max: 7 },
    category: "reward",
    autoCalculate: true,
    calculationRule: "weekly_completion_rate >= 90%"
  },
  // 挑战任务
  {
    name: "超级挑战",
    description: "连续7天独立完成作业",
    taskType: "challenge",
    cycleType: "weekly",
    points: 10,
    habitTags: ["学习", "坚持"],
    tips: "连续7天独立完成作业，挑战成功！",
    difficulty: "hard",
    ageRange: { min: 6, max: 7 },
    category: "study",
    challengeTarget: { targetCount: 7, timeLimit: "1week" },
    challengeReward: { points: 10, badge: "学习小达人" }
  }
]

// 为6岁一年级儿童预设的奖励模板
const defaultGrade1RewardTemplates = [
  {
    name: "一本新绘本",
    description: "选一本你最喜欢的书！",
    rewardType: "physical",
    pointsRequired: 15,
    habitTags: ["学习", "阅读"],
    ageRange: { min: 6, max: 7 },
    category: "study_supplies",
    stock: 999 // 虚拟库存
  },
  {
    name: "小汽车玩具",
    description: "酷酷的小车，开动啦！",
    rewardType: "physical",
    pointsRequired: 25,
    habitTags: ["娱乐", "玩具"],
    ageRange: { min: 6, max: 7 },
    category: "entertainment",
    stock: 999
  },
  {
    name: "多看30分钟动画片",
    description: "周末可以多看半小时哦！",
    rewardType: "privilege",
    pointsRequired: 10,
    habitTags: ["娱乐", "放松"],
    ageRange: { min: 6, max: 7 },
    category: "entertainment",
    exchangeRules: "只能在周末使用，需要家长陪同"
  },
  {
    name: "决定周末家庭活动",
    description: "去公园？看电影？你说了算！",
    rewardType: "privilege",
    pointsRequired: 30,
    habitTags: ["家庭", "决策"],
    ageRange: { min: 6, max: 7 },
    category: "family",
    exchangeRules: "需要全家一起讨论决定"
  },
  {
    name: "和爸爸/妈妈一起打游戏30分钟",
    description: "专属亲子游戏时间！",
    rewardType: "experience",
    pointsRequired: 15,
    habitTags: ["亲子", "娱乐"],
    ageRange: { min: 6, max: 7 },
    category: "family",
    exchangeRules: "需要家长陪同参与"
  },
  {
    name: "去吃一次冰淇淋",
    description: "选你喜欢的口味！",
    rewardType: "experience",
    pointsRequired: 20,
    habitTags: ["美食", "享受"],
    ageRange: { min: 6, max: 7 },
    category: "entertainment",
    exchangeRules: "需要家长陪同"
  },
  {
    name: "小帮手勋章（电子版）",
    description: "佩戴在个人主页，闪闪发光！",
    rewardType: "virtual",
    pointsRequired: 5,
    habitTags: ["成就", "荣誉"],
    ageRange: { min: 6, max: 7 },
    category: "virtual",
    isVirtual: true
  },
  {
    name: "为流浪小猫捐一顿猫粮",
    description: "爱心小天使，帮助小动物！",
    rewardType: "charity",
    pointsRequired: 15,
    habitTags: ["爱心", "公益"],
    ageRange: { min: 6, max: 7 },
    category: "charity",
    exchangeRules: "积分将捐赠给动物保护组织"
  }
]
```

#### 10.3.5 模板使用功能

- **一键导入**: 家长可以一键导入整套模板，快速建立适合6岁儿童的任务和奖励体系
- **智能匹配**: 系统根据儿童年龄自动推荐默认模板
- **个性化调整**: 家长可以在默认模板基础上进行个性化调整，如修改积分值、调整任务说明等
- **分批应用**: 支持按类别（学习、生活、娱乐等）分批应用模板
- **进度追踪**: 系统自动追踪默认模板的使用效果，提供统计数据

### 11. 模板管理模块 (template-management)
**路径**: `/pages/template-management/template-management`
**功能描述**: 专门用于维护任务模板和兑换奖励模板的管理页面，供高级用户和系统管理员使用

#### 11.1 模板管理控制面板
- 模板分类管理（任务模板、奖励模板）
- 模板列表展示和筛选
- 模板状态管理（启用/停用）
- 模板使用统计查看

#### 11.2 任务模板管理页面
- 任务模板创建、编辑、删除功能
- 任务模板详情查看和预览
- 任务模板分类管理
- 任务模板适用年龄段设置
- 任务模板标签管理
- 任务模板复制功能

#### 11.3 奖励模板管理页面
- 奖励模板创建、编辑、删除功能
- 奖励模板详情查看和预览
- 奖励模板分类管理
- 奖励模板适用年龄段设置
- 奖励模板标签管理
- 奖励模板库存管理

#### 11.4 模板导入导出功能
- 支持从Excel/CSV文件导入模板
- 支持将模板导出为Excel/CSV文件
- 批量操作支持
- 模板版本管理

#### 11.5 权限控制
- 只有管理员和高级用户可以访问模板管理页面
- 普通家长用户只能查看和使用模板，不能编辑系统模板
- 操作日志记录

---

## 🔧 核心业务逻辑

### 1. 用户认证流程
```
graph TD
    A[打开小程序] --> B[检查登录状态]
    B --> C{是否已登录}
    C -->|是| D[加载用户数据]
    C -->|否| E[微信授权登录]
    E --> F[创建用户记录]
    F --> D
    D --> G[加载儿童列表]
    G --> H[设置当前儿童]
    H --> I[进入首页]
```

### 2. 任务完成流程
```
graph TD
    A[选择任务] --> B[验证完成条件]
    B --> C{是否符合要求}
    C -->|否| D[提示错误信息]
    C -->|是| E[记录完成状态]
    E --> F[计算积分奖励]
    F --> G[更新儿童积分]
    G --> H[更新儿童累计获得积分]
    H --> I[创建积分记录]
    I --> J[检查成就条件]
    J --> K[更新挑战任务进度]
    K --> L[判断挑战任务是否完成]
    L --> M[完成反馈]
```

### 3. 添加任务业务流程（含预设模板）
```
graph TD
    A[进入添加任务页面] --> B[选择创建方式]
    B --> C{手动创建 or 使用模板}
    
    C -->|手动创建| D[填写任务表单]
    D --> E[设置任务参数]
    E --> F[保存任务]
    
    C -->|使用模板| G[选择年龄段]
    G --> H[加载对应模板列表]
    H --> I[选择具体模板]
    I --> J[模板内容预览]
    J --> K{确认使用模板}
    K -->|否| H
    K -->|是| L[应用模板到表单]
    L --> M{需要修改?}
    M -->|是| N[个性化修改]
    M -->|否| O[确认保存]
    N --> O
    
    F --> P[任务创建成功]
    O --> P
    P --> Q[刷新任务列表]
    
    style G fill:#e1f5fe
    style H fill:#e8f5e8
    style I fill:#e8f5e8
    style J fill:#fff3e0
```

### 4. 批量导入模板流程
```
graph TD
    A[选择批量导入] --> B[选择年龄段模板]
    B --> C[预览模板套装]
    C --> D{确认导入全套?}
    D -->|否| E[返回选择]
    D -->|是| F[开始批量创建]
    F --> G[创建任务记录]
    G --> H[创建奖励记录]
    H --> I[更新统计数据]
    I --> J[导入完成提示]
    J --> K[刷新页面数据]
    
    style F fill:#e8f5e8
    style G fill:#e8f5e8
    style H fill:#e8f5e8
```

### 5. 积分计算规则
- **基础积分**: 任务预设积分值
- **难度加成**: 根据任务难度增加10%-50%积分
- **连续奖励**: 连续完成给予额外20%积分
- **完美一日**: 当日全部任务完成额外获得50%积分
- **挑战完成**: 挑战任务完成获得挑战奖励积分
- **积分统计**: 获得积分同时更新儿童累计获得积分字段
- **积分消耗**: 兑换奖励时同时更新儿童累计消耗积分字段

### 6. 奖励兑换机制
```
graph TD
    A[选择奖励] --> B[检查积分余额]
    B --> C{积分是否足够}
    C -->|否| D[提示积分不足]
    C -->|是| E[检查库存状态]
    E --> F{库存是否充足}
    F -->|否| G[提示库存不足]
    F -->|是| H[创建兑换申请]
    H --> I[扣除积分]
    I --> J[更新库存]
    J --> K[创建兑换记录]
    K --> L[更新儿童累计消耗积分]
```

### 7. 成就和挑战任务触发机制

#### 7.1 成就触发时机
```
graph TD
    A[任务完成] --> B[检查成就条件]
    B --> C{类型判断}
    
    C -->|首次成就| D[检查是否首次完成]
    D --> E{首次完成?}
    E -->|是| F[获得成就奖励]
    E -->|否| G[无奖励]
    
    C -->|连续成就| H[检查连续天数]
    H --> I{连续达标?}
    I -->|是| F
    I -->|否| J[继续统计]
    
    F --> N[创建成就记录]
    N --> O[发放成就奖励]
    
    style F fill:#e8f5e8
    style N fill:#e8f5e8
```

#### 7.2 挑战任务进度更新
```
graph TD
    A[普通任务完成] --> B[检查相关挑战任务]
    B --> C{存在相关挑战?}
    C -->|否| D[结束处理]
    C -->|是| E[更新挑战进度]
    
    E --> F[计算完成百分比]
    F --> G{达到100%?}
    G -->|否| H[显示进度更新]
    G -->|是| I[挑战任务完成]
    
    I --> J[发放挑战奖励]
    J --> K[创建成就记录]
    K --> L[更新任务状态]
    
    style I fill:#fff3e0
    style J fill:#e8f5e8
    style K fill:#e8f5e8
```

#### 7.3 成就和挑战判断逻辑

```
// 成就检查和发放系统
class AchievementManager {
  constructor() {
    this.achievementRules = {
      // 首次成就：首次完成特定任务
      firstTime: {
        'first_homework': {
          condition: (records) => this.isFirstTimeTask(records, 'homework'),
          reward: { points: 5, badge: '作业小能手' }
        },
        'first_reading': {
          condition: (records) => this.isFirstTimeTask(records, 'reading'),
          reward: { points: 3, badge: '阅读启蒙' }
        }
      },
      
      // 连续成就：连续天数完成
      consecutive: {
        'reading_7days': {
          condition: (records) => this.checkConsecutiveDays(records, 'reading', 7),
          reward: { points: 15, badge: '阅读小博士' }
        },
        'exercise_30days': {
          condition: (records) => this.checkConsecutiveDays(records, 'exercise', 30),
          reward: { points: 50, badge: '运动大师' }
        }
      }
    }
  }
  
  // 任务完成后触发成就检查
  async checkAchievements(childId, completedTask) {
    try {
      // 1. 获取儿童的任务完成记录
      const taskRecords = await this.getChildTaskRecords(childId)
      
      // 2. 检查所有成就类型
      const earnedAchievements = []
      
      // 检查首次成就
      for (const [key, achievement] of Object.entries(this.achievementRules.firstTime)) {
        if (achievement.condition(taskRecords) && !await this.hasAchievement(childId, key)) {
          earnedAchievements.push({ type: 'firstTime', key, ...achievement.reward })
        }
      }
      
      // 检查连续成就
      for (const [key, achievement] of Object.entries(this.achievementRules.consecutive)) {
        if (achievement.condition(taskRecords) && !await this.hasAchievement(childId, key)) {
          earnedAchievements.push({ type: 'consecutive', key, ...achievement.reward })
        }
      }
      
      // 3. 发放成就奖励
      for (const achievement of earnedAchievements) {
        await this.grantAchievement(childId, achievement)
      }
      
      return earnedAchievements
    } catch (error) {
      console.error('成就检查失败:', error)
      return []
    }
  }
  
  // 挑战任务进度更新
  async updateChallengeProgress(childId, completedTask) {
    try {
      // 1. 查找相关的挑战任务
      const challenges = await this.getActiveChallenges(childId, completedTask.habitTags)
      
      for (const challenge of challenges) {
        // 2. 更新挑战进度
        const progress = await this.calculateChallengeProgress(challenge, childId)
        
        // 3. 检查是否完成
        if (progress.percentage >= 100 && challenge.status !== 'completed') {
          // 挑战完成
          await this.completeChallengeTask(challenge, childId)
        } else {
          // 更新进度
          await this.updateChallengeRecord(challenge._id, childId, progress)
        }
      }
    } catch (error) {
      console.error('挑战任务更新失败:', error)
    }
  }
  
  // 计算挑战任务进度
  async calculateChallengeProgress(challenge, childId) {
    const { challengeTarget } = challenge
    const { targetCount, timeLimit, habitType } = challengeTarget
    
    // 根据时间限制获取记录
    const timeRange = this.getTimeRange(timeLimit)
    const records = await this.getTaskRecordsInRange(childId, habitType, timeRange)
    
    const currentCount = records.length
    const percentage = Math.min((currentCount / targetCount) * 100, 100)
    
    return {
      currentCount,
      targetCount,
      percentage: Math.round(percentage),
      timeRange,
      isCompleted: percentage >= 100
    }
  }
  
  // 完成挑战任务
  async completeChallengeTask(challenge, childId) {
    const db = wx.cloud.database()
    
    try {
      // 1. 更新任务状态
      await db.collection('tasks').doc(challenge._id).update({
        data: {
          status: 'completed',
          completeTime: new Date(),
          updateTime: new Date()
        }
      })
      
      // 2. 发放挑战奖励
      const { points, badge } = challenge.challengeReward
      
      // 更新儿童积分
      await db.collection('children').doc(childId).update({
        data: {
          totalPoints: db.command.inc(points),
          totalEarnedPoints: db.command.inc(points),
          updateTime: new Date()
        }
      })
      
      // 创建积分记录
      await db.collection('point_records').add({
        data: {
          childId,
          points,
          changeType: 'challenge_reward',
          reason: `挑战任务完成: ${challenge.name}`,
          sourceId: challenge._id,
          recordTime: new Date(),
          createTime: new Date()
        }
      })
      
      // 3. 创建成就记录
      if (badge) {
        await db.collection('achievements').add({
          data: {
            childId,
            name: badge,
            description: `完成挑战: ${challenge.name}`,
            icon: challenge.icon || '🏆',
            earnedDate: new Date(),
            createTime: new Date()
          }
        })
      }
      
      // 4. 发送通知
      this.sendChallengeCompletionNotice(childId, challenge)
      
    } catch (error) {
      console.error('挑战任务完成处理失败:', error)
      throw error
    }
  }
}

// 使用示例：在任务完成后调用
const achievementManager = new AchievementManager()

// 在manageTasks云函数的completeTask函数中添加
async function completeTask(data, openid) {
  // ... 现有任务完成逻辑 ...
  
  // 检查成就和更新挑战进度
  await achievementManager.checkAchievements(childId, task)
  await achievementManager.updateChallengeProgress(childId, task)
  
  // ... 返回结果 ...
}
```

#### 7.4 触发时机和判断规则

##### 🔔 **主要触发时机**

1. **任务完成后** - 每次普通任务完成都会触发检查
2. **每日定时检查** - 每天晚上23:59检查当日成就
3. **每周定时检查** - 每周日晚上检查周成就
4. **每月定时检查** - 每月末检查月成就
5. **手动触发** - 家长或儿童主动查看成就进度

##### 🏆 **成就类型判断规则**

```
// 成就判断规则配置
const achievementRules = {
  // 1. 首次成就：第一次完成某类任务
  firstTime: {
    trigger: '任务完成后立即检查',
    condition: '检查是否首次完成该类型任务',
    examples: ['首次完成作业', '首次阅读30分钟']
  },
  
  // 2. 连续成就：连续多天完成相同任务
  consecutive: {
    trigger: '每日晚上23:59定时检查 + 任务完成后检查',
    condition: '检查连续天数是否达标',
    examples: ['连续7天阅读', '连续30天运动']
  }
}
```

##### 🎯 **挑战任务进度判断**

```
// 挑战任务完成条件
const challengeCompletionRules = {
  // 数量型挑战：完成指定次数
  countBased: {
    trigger: '相关任务完成后立即更新',
    calculation: '当前次数 / 目标次数 * 100%',
    completion: '进度达到100%时自动完成',
    example: '一周内阅读7次 (7/7 = 100%)'
  },
  
  // 时间型挑战：在指定时间内完成
  timeBased: {
    trigger: '时间限制到期后检查 + 相关任务完成后检查',
    calculation: '在时间范围内的完成次数',
    completion: '在限定时间内达成目标即完成',
    example: '30天内运动20次 (进度时时更新)'
  },
  
  // 连续型挑战：连续完成不中断
  consecutiveBased: {
    trigger: '每日检查连续性 + 任务完成/未完成时检查',
    calculation: '当前连续天数',
    completion: '连续天数达标且无中断',
    failure: '一天未完成则重新计算',
    example: '连续21天早起 (中断一天则重新开始)'
  }
}
```

##### 🔄 **数据同步机制**

使用统一数据管理器维护成就和挑战进度：

```
// 遵循用户偏好的统一数据管理
const { businessDataManager } = require('../../utils/data-manager')

// 成就数据管理
class AchievementDataManager {
  // 缓存成就进度数据
  cacheAchievementProgress(childId, progressData) {
    const cacheKey = `achievement_progress_${childId}`
    businessDataManager.setSettings({ [cacheKey]: progressData })
  }
  
  // 缓存挑战进度数据
  cacheChallengeProgress(childId, challengeData) {
    const cacheKey = `challenge_progress_${childId}`
    businessDataManager.setSettings({ [cacheKey]: challengeData })
  }
  
  // 清理过期缓存
  clearExpiredCache() {
    // 定期清理过期的进度数据
  }
}
```
### 1. 设计主题
- **主题色**: 绿色系 (#4CAF50)
- **辅助色**: 淡绿色 (#81C784), 深绿色 (#388E3C)
- **强调色**: 橙色 (#FF9800), 红色 (#F44336)
- **中性色**: 灰色系列 (#757575, #BDBDBD, #F5F5F5)

### 2. 界面布局原则
- **操作按钮**: 统一放置在界面右上角（如三个点、设置按钮）
- **关闭按钮**: 位于右上角，采用简洁的纯文本样式，避免椭圆形背景
- **模板选择器**: 在添加任务/奖励页面，模板按钮位于表单上方，使用绿色边框
- **导航结构**: 底部Tab导航 + 页面内导航
- **内容布局**: 卡片式布局，清晰的视觉层次
- **交互反馈**: 及时的操作反馈和状态提示

---

## 🚀 技术实现要点

### 1. 统一数据管理架构
```
// 数据管理层 (data-manager.js)
const businessDataManager = {
  // 用户信息管理
  setUserInfo(), getUserInfo(),
  
  // 儿童信息管理
  setCurrentChild(), getCurrentChild(), 
  setChildrenList(), getChildrenList(),
  
  // 缓存和同步
  syncFromGlobalData(), clearAll()
}
```

### 2. 云函数设计模式
```
// 云函数统一结构
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, data } = event
  
  try {
    switch (action) {
      case 'list': return await listItems(data)
      case 'create': return await createItem(data, wxContext.OPENID)
      case 'update': return await updateItem(data)
      case 'delete': return await deleteItem(data)
      default: return { code: -1, message: '未知操作' }
    }
  } catch (error) {
    return handleError(action, error)
  }
}
```

### 3. 权限控制机制
```
// 权限验证
const checkPermission = (operation, userId, targetData) => {
  switch(operation) {
    case 'create_task':
      return targetData.parentId === userId
    case 'complete_task':
      return targetData.childId === userId || isParent(userId, targetData.childId)
    case 'exchange_reward':
      return isParent(userId, targetData.childId)
    default:
      return false
  }
}
```

### 6. 模板界面设计规范
```
// 添加任务页面的模板选择器设计
const templateSelectorConfig = {
  // 遵循用户偏好的绿色主题
  primaryColor: '#4CAF50',
  
  // 按钮布局：右上角位置
  templateButton: {
    position: 'top-right',
    style: 'green-border',
    text: '选择模板'
  },
  
  // 关闭按钮：简洁纯文本样式
  closeButton: {
    position: 'top-right',
    style: 'plain-text',
    text: '关闭',
    background: 'none'
  },
  
  // 模板列表布局
  templateList: {
    layout: 'card-grid',
    itemsPerRow: 2,
    spacing: '16rpx',
    cardStyle: {
      borderColor: '#E8F5E8',
      hoverColor: '#4CAF50'
    }
  }
}

// 模板选择器交互流程
const templateInteractionFlow = {
  // 1. 点击"选择模板"按钮
  openTemplateSelector() {
    // 根据当前儿童年龄智能推荐
    const ageGroup = this.getAgeGroupFromChild()
    this.loadTemplatesByAge(ageGroup)
    this.showTemplateModal()
  },
  
  // 2. 模板分类选择
  filterByCategory(category) {
    // 学习、生活、运动、社交等分类
    this.filterTemplates(category)
  },
  
  // 3. 模板预览和应用
  previewTemplate(template) {
    this.showTemplateDetail(template)
    // 显示模板完整信息
  },
  
  // 4. 应用模板到表单
  applyTemplate(template) {
    // 使用统一数据管理器
    this.fillFormWithTemplate(template)
    this.closeTemplateModal()
    wx.showToast({ title: '模板已应用', icon: 'success' })
  }
}
```
### 7. 字典管理使用示例
```
// 获取任务类型选项
const { dictionaryApi } = require('../../utils/api-services')

// 加载任务类型字典
async function loadTaskTypes() {
  const taskTypes = await dictionaryApi.getByCategory('task_type')
  this.setData({ taskTypes })
}

// 加载奖励类型字典
async function loadRewardTypes() {
  const rewardTypes = await dictionaryApi.getByCategory('reward_type')
  this.setData({ rewardTypes })
}

// 使用统一数据管理器缓存字典数据
const { businessDataManager } = require('../../utils/data-manager')
businessDataManager.setSettings({ dictionaries: allDictionaries })
```

### 8. 预设模板使用示例
```
// 预设模板管理和使用
const { templatesApi } = require('../../utils/api-services')
const { businessDataManager } = require('../../utils/data-manager')

// 在添加任务页面加载模板
async function loadTaskTemplates() {
  const currentChild = businessDataManager.getCurrentChild()
  const ageGroup = this.getAgeGroup(currentChild.age) // 'grade1', 'grade2', etc.
  
  const templates = await templatesApi.getTaskTemplates(ageGroup)
  this.setData({ 
    taskTemplates: templates,
    showTemplateSelector: true 
  })
}

// 应用模板到表单
async function applyTaskTemplate(templateId) {
  const template = this.data.taskTemplates.find(t => t.id === templateId)
  
  // 填充表单字段
  this.setData({
    'formData.name': template.name,
    'formData.description': template.description,
    'formData.taskType': template.taskType,
    'formData.points': template.points,
    'formData.habitTags': template.habitTags,
    'formData.tips': template.tips
  })
  
  wx.showToast({ title: '模板已应用', icon: 'success' })
}

// 批量导入模板
async function batchImportTemplates(ageGroup) {
  try {
    wx.showLoading({ title: '导入中...' })
    
    const result = await templatesApi.applyTemplate({
      ageGroup: ageGroup,
      parentId: businessDataManager.getUserInfo().openid,
      childId: businessDataManager.getCurrentChild()._id
    })
    
    wx.hideLoading()
    wx.showToast({ 
      title: `成功导入${result.taskCount}个任务和${result.rewardCount}个奖励`,
      icon: 'success',
      duration: 3000
    })
    
    // 刷新页面数据
    this.refreshData()
    
  } catch (error) {
    wx.hideLoading()
    wx.showToast({ title: '导入失败', icon: 'error' })
  }
}

// 导入默认模板（为6岁一年级儿童）
async function importDefaultTemplates() {
  try {
    wx.showLoading({ title: '导入默认模板...' })
    
    const result = await templatesApi.applyDefaultTemplate({
      childAge: 6, // 6岁儿童
      parentId: businessDataManager.getUserInfo().openid,
      childId: businessDataManager.getCurrentChild()._id
    })
    
    wx.hideLoading()
    wx.showToast({ 
      title: `成功导入默认模板：${result.taskCount}个任务和${result.rewardCount}个奖励`,
      icon: 'success',
      duration: 3000
    })
    
    // 刷新页面数据
    this.refreshData()
    
  } catch (error) {
    wx.hideLoading()
    wx.showToast({ title: '导入失败', icon: 'error' })
  }
}

// 根据年龄获取年龄段
function getAgeGroup(age) {
  if (age >= 6 && age <= 7) return 'grade1'
  if (age >= 8 && age <= 9) return 'grade2'
  if (age >= 10 && age <= 11) return 'grade3'
  // ... 其他年龄段
  return 'general'
}
```

### 9. 默认模板管理示例
```javascript
// 默认模板管理
const defaultTemplates = {
  // 获取适合指定年龄的默认模板
  getDefaultTemplatesForAge(age) {
    if (age === 6) {
      return {
        tasks: defaultGrade1TaskTemplates,
        rewards: defaultGrade1RewardTemplates
      }
    }
    // 其他年龄段的默认模板
    return {
      tasks: [],
      rewards: []
    }
  },
  
  // 应用默认模板
  async applyDefaultTemplates(data) {
    const { childAge, parentId, childId } = data
    const templates = this.getDefaultTemplatesForAge(childAge)
    
    let taskCount = 0
    let rewardCount = 0
    
    // 创建任务模板记录
    for (const taskTemplate of templates.tasks) {
      await db.collection('task_templates').add({
        data: {
          ...taskTemplate,
          parentId: parentId,
          childId: childId,
          createTime: new Date(),
          updateTime: new Date()
        }
      })
      taskCount++
    }
    
    // 创建奖励模板记录
    for (const rewardTemplate of templates.rewards) {
      await db.collection('reward_templates').add({
        data: {
          ...rewardTemplate,
          parentId: parentId,
          childId: childId,
          createTime: new Date(),
          updateTime: new Date()
        }
      })
      rewardCount++
    }
    
    return { taskCount, rewardCount }
  }
}
```

---

## 📊 性能优化策略

### 1. 数据加载优化
- **分页加载**: 大数据量采用分页机制
- **缓存策略**: 热点数据本地缓存
- **预加载**: 关键数据提前加载
- **懒加载**: 非关键数据按需加载

### 2. 网络请求优化
- **并发请求**: 多个独立请求并行执行
- **请求去重**: 防止重复请求同一接口
- **超时处理**: 设置合理的请求超时时间
- **重试机制**: 失败请求自动重试

### 3. 内存管理优化
- **数据清理**: 及时清理不需要的数据
- **图片优化**: 合理的图片尺寸和格式
- **组件销毁**: 页面卸载时清理资源

---

## 🔒 安全性设计

### 1. 数据安全
- **访问控制**: 严格的数据访问权限
- **输入验证**: 所有用户输入严格验证
- **敏感数据加密**: 重要信息加密存储

### 2. 接口安全
- **权限验证**: 每个接口调用验证用户权限
- **参数校验**: 严格验证接口参数
- **频率限制**: 防止接口被恶意调用

### 3. 业务安全
- **操作审计**: 记录关键操作日志
- **异常监控**: 监控异常操作行为
- **数据备份**: 定期备份重要数据

---

## 🚀 部署和维护

### 1. 开发环境配置
- **云环境ID**: 配置微信云开发环境
- **云函数部署**: 批量部署所有云函数
- **数据库初始化**: 创建集合和索引
- **权限配置**: 设置数据库访问权限

### 2. 生产环境部署
- **版本管理**: 使用版本控制管理代码
- **发布流程**: 标准化发布流程
- **回滚机制**: 问题版本快速回滚
- **监控告警**: 系统状态实时监控

### 3. 运维监控
- **性能监控**: 关键指标实时监控
- **错误监控**: 异常情况及时告警
- **用户行为**: 用户使用情况分析
- **数据统计**: 业务数据定期统计

---

## 📝 开发规范

### 1. 代码规范可以获取微信小程序的开发规范
- **代码质量**: 可使用context7 mcp工具获取最新的小程序和版本相符合的api接口,防止使用了微信小程序不支持的api和方法。
- **代码风格**: 统一的代码风格
- **命名规范**: 统一的变量和函数命名
- **注释规范**: 完整的代码注释
- **格式规范**: 一致的代码格式
- **ES6语法**: 使用现代JavaScript语法,wxml文件中绑定属性不要使用方法名绑定方法的返回值。


### 2. 组件规范
- **组件化开发**: 可复用的组件设计
- **状态管理**: 统一的状态管理模式
- **事件处理**: 标准化事件处理机制
- **样式管理**: 模块化样式管理

### 3. 测试规范
- **单元测试**: 关键函数单元测试
- **集成测试**: 模块间集成测试
- **用户测试**: 用户体验测试
- **性能测试**: 性能指标测试

---

## 📚 项目文件结构

```
KidStars/
├── app.js                          # 应用入口文件
├── app.json                        # 应用配置文件
├── app.wxss                        # 全局样式文件
├── pages/                          # 页面目录
│   ├── index/                      # 首页
│   ├── parent/                     # 家长管理
│   ├── child/                      # 儿童视图
│   ├── tasks/                      # 任务管理
│   ├── rewards/                    # 奖励商店
│   ├── points/                     # 积分中心
│   ├── analysis/                   # 数据分析
│   ├── settings/                   # 系统设置
│   ├── dictionary/                 # 字典配置管理
│   └── templates/                  # 预设模板管理
├── utils/                          # 工具类目录
│   ├── api-client.js               # API客户端
│   ├── api-services.js             # API服务层
│   └── data-manager.js             # 数据管理器
├── cloudfunctions/                 # 云函数目录
│   ├── getUserInfo/         # 用户信息管理
│   ├── manageChildren/      # 儿童信息管理
│   ├── manageTasks/         # 任务管理
│   ├── manageRewards/       # 奖励管理
│   ├── managePoints/        # 积分系统管理
│   ├── dataAnalysis/        # 数据分析
│   ├── manageDictionary/    # 字典管理 (任务类型、周期类型、奖励类型等)
│   ├── manageTemplates/     # 预设模板管理 (一年级、二年级等年龄段模板)
│   ├── manageTemplateData/  # 模板数据管理 (新增：任务模板和奖励模板的增删改查)
│   ├── importExportTemplates/ # 模板导入导出功能 (新增)
│   └── ...                         # 其他云函数
├── components/                     # 自定义组件
├── images/                         # 图片资源
└── scripts/                        # 脚本工具
```

---

## 📈 总结

这个项目文档涵盖了KidStars儿童积分奖励系统的完整设计，包括：

1. **完整的数据库设计** - 12张核心数据表，覆盖用户、儿童、任务、奖励、积分、模板等所有业务数据
2. **系统架构设计** - 云函数架构、API服务层、统一数据管理
3. **功能模块划分** - 10个主要功能模块，包括新增的字典配置和预设模板模块，每个模块职责清晰
4. **业务逻辑设计** - 核心业务流程和规则定义，包括6岁一年级儿童的专业模板
5. **技术实现要点** - 关键技术方案和最佳实践，包括模板管理和字典系统
6. **性能和安全** - 优化策略和安全保障措施
7. **部署维护** - 完整的部署和运维方案

该文档可作为重新开发小程序的完整技术参考，确保新版本在架构设计、功能实现、性能优化等方面都有清晰的指导.