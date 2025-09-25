# 任务类别和习惯标签标准化方案

## 问题分析

### 当前存在的问题

1. **类别定义不统一**
   - 前端页面使用：`study`, `life`, `sport`, `health`, `social`, `creative`, `reading`, `music`
   - 模板数据使用：`hygiene`, `organization`, `self_care`
   - 组件映射包含：`organization`, `housework`, `skill`, `financial`

2. **习惯标签分散管理**
   - 云函数字典：32个标准化标签（学习类、生活习惯类、品德修养类等）
   - 前端页面：简化的常用标签列表
   - 缺乏统一的分类和管理

3. **代码重复**
   - 多个文件中重复定义相同的映射关系
   - 维护困难，容易出现不一致

4. **扩展性差**
   - 新增类别需要修改多个文件
   - 没有统一的配置入口

## 解决方案

### 1. 统一配置文件

创建 `utils/task-categories-config.js` 作为唯一的配置源：

#### 任务类别定义
```javascript
const TASK_CATEGORIES = {
  // 学习类
  study: { code: 'study', label: '学习', emoji: '📚', color: '#4CAF50' },
  reading: { code: 'reading', label: '阅读', emoji: '📖', color: '#FF9800' },
  
  // 生活类
  life: { code: 'life', label: '生活', emoji: '🏠', color: '#2196F3' },
  hygiene: { code: 'hygiene', label: '卫生', emoji: '🧼', color: '#00BCD4' },
  self_care: { code: 'self_care', label: '自理', emoji: '👕', color: '#9C27B0' },
  organization: { code: 'organization', label: '整理', emoji: '📦', color: '#795548' },
  housework: { code: 'housework', label: '家务', emoji: '🧹', color: '#607D8B' },
  
  // 健康运动类
  health: { code: 'health', label: '健康', emoji: '💪', color: '#4CAF50' },
  sport: { code: 'sport', label: '运动', emoji: '⚽', color: '#FF5722' },
  
  // 社交情感类
  social: { code: 'social', label: '社交', emoji: '👥', color: '#E91E63' },
  family: { code: 'family', label: '家庭', emoji: '👨‍👩‍👧‍👦', color: '#FF9800' },
  
  // 创意艺术类
  creative: { code: 'creative', label: '创意', emoji: '🎨', color: '#9C27B0' },
  music: { code: 'music', label: '音乐', emoji: '🎵', color: '#3F51B5' },
  art: { code: 'art', label: '艺术', emoji: '🖌️', color: '#E91E63' },
  
  // 技能发展类
  skill: { code: 'skill', label: '技能', emoji: '🛠️', color: '#795548' },
  financial: { code: 'financial', label: '理财', emoji: '💰', color: '#4CAF50' },
  
  // 其他
  entertainment: { code: 'entertainment', label: '娱乐', emoji: '🎪', color: '#FF9800' }
};
```

#### 习惯标签分类
```javascript
const HABIT_TAGS = {
  life_basic: {
    category: '基础生活',
    tags: ['卫生', '自理', '整理', '独立', '健康', '作息', '饮食', '安全']
  },
  learning: {
    category: '学习成长',
    tags: ['学习', '阅读', '书写', '练习', '知识', '专注', '自律', '思考', '记忆']
  },
  character: {
    category: '品格修养',
    tags: ['责任感', '礼貌', '分享', '友善', '关爱', '诚实', '感恩', '尊重', '善良']
  },
  social: {
    category: '社交协作',
    tags: ['社交', '协作', '友谊', '亲子', '沟通', '团队', '领导力', '同理心']
  },
  skills: {
    category: '技能发展',
    tags: ['技能', '艺术', '创意', '运动', '音乐', '手工', '科技', '探索']
  },
  emotion: {
    category: '情绪管理',
    tags: ['情绪', '耐心', '坚持', '勇气', '自信', '冷静', '乐观', '抗挫']
  },
  financial: {
    category: '理财规划',
    tags: ['理财', '规划', '储蓄', '消费', '价值观', '目标']
  },
  special: {
    category: '特殊类型',
    tags: ['挑战', '创新', '突破', '成就', '里程碑', '季节性']
  }
};
```

### 2. 工具函数

提供便捷的工具函数：

```javascript
const TaskCategoriesUtils = {
  // 获取类别选项
  getCategoryOptions() {
    return Object.values(TASK_CATEGORIES).map(cat => ({
      value: cat.code,
      label: cat.label,
      emoji: cat.emoji
    }));
  },
  
  // 获取类别显示文本
  getCategoryText(code) {
    const category = TASK_CATEGORIES[code];
    return category ? category.label : (code || '未分类');
  },
  
  // 获取所有习惯标签
  getAllHabitTags() {
    const allTags = [];
    Object.values(HABIT_TAGS).forEach(group => {
      allTags.push(...group.tags);
    });
    return [...new Set(allTags)];
  },
  
  // 其他工具函数...
};
```

### 3. 迁移步骤

#### 步骤1：更新组件
- ✅ 已完成：`components/task-item/task-item.js`
- 使用统一的工具函数替换硬编码映射

#### 步骤2：更新页面
需要更新的页面：
- `pages/tasks/add.js`
- `pages/tasks/edit.js`
- `pages/template-editor/template-editor.js`
- `pages/template-management/template-management.js`

#### 步骤3：更新模板数据
- 统一模板文件中的类别代码
- 确保与新配置一致

#### 步骤4：更新云函数
- 更新字典数据结构
- 确保与前端配置同步

## 优势

### 1. 一致性
- 所有页面和组件使用相同的类别定义
- 避免显示不一致的问题

### 2. 可维护性
- 单一配置源，修改一处即可
- 减少代码重复

### 3. 扩展性
- 新增类别只需修改配置文件
- 支持丰富的元数据（颜色、图标、描述等）

### 4. 类型安全
- 统一的数据结构
- 便于后续添加 TypeScript 支持

## 使用示例

### 在页面中使用
```javascript
const { TaskCategoriesUtils } = require('../../utils/task-categories-config.js');

Page({
  data: {
    categories: TaskCategoriesUtils.getCategoryOptions(),
    habitTags: TaskCategoriesUtils.getAllHabitTags()
  },
  
  formatTask(task) {
    return {
      ...task,
      categoryText: TaskCategoriesUtils.getCategoryText(task.category),
      ageGroupText: TaskCategoriesUtils.getAgeGroupText(task.ageGroup)
    };
  }
});
```

### 在组件中使用
```javascript
const { TaskCategoriesUtils } = require('../../utils/task-categories-config.js');

Component({
  methods: {
    getCategoryText(category) {
      return TaskCategoriesUtils.getCategoryText(category);
    }
  }
});
```

## 后续计划

1. **完成迁移**：将所有页面迁移到统一配置
2. **数据同步**：确保数据库中的类别代码与配置一致
3. **文档完善**：为开发者提供详细的使用文档
4. **测试验证**：确保迁移后功能正常
5. **性能优化**：考虑缓存机制，提高性能

## 注意事项

1. **向后兼容**：确保现有数据不受影响
2. **渐进迁移**：可以逐步迁移，不需要一次性完成
3. **数据验证**：迁移过程中验证数据完整性
4. **用户体验**：确保迁移过程中用户体验不受影响

通过这个标准化方案，项目的任务类别和习惯标签将更加规范、一致和易于维护。