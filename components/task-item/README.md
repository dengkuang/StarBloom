# 任务卡片组件 (task-item)

## 功能特性

### 🎯 丰富的信息展示
- **基础信息**：任务名称、描述、积分奖励
- **分类标签**：难度等级、任务类型、类别标签
- **习惯标签**：多个习惯标签展示
- **年龄适配**：显示适合的年龄组
- **周期信息**：任务执行周期

### 🏆 挑战系统
- **挑战目标**：显示挑战描述和目标
- **进度条**：可视化挑战完成进度
- **奖励信息**：挑战完成后的额外奖励

### ✅ 完成状态
- **状态指示**：视觉化的完成状态标识
- **完成时间**：智能显示完成时间（刚刚、几分钟前等）
- **完成徽章**：已完成任务的特殊标识

### 💡 交互功能
- **操作提示**：显示任务操作建议
- **点击展开**：点击卡片展开详细信息
- **多种操作**：完成、编辑、删除等操作

## 使用方法

### 1. 在页面配置中注册组件

```json
{
  "usingComponents": {
    "task-item": "/components/task-item/task-item"
  }
}
```

### 2. 在页面中使用组件

```xml
<!-- 基础使用 -->
<task-item 
  task="{{taskData}}" 
  bind:complete="onTaskComplete"
  bind:tap="onTaskTap">
</task-item>

<!-- 管理模式（显示编辑按钮） -->
<task-item 
  task="{{taskData}}" 
  show-actions="{{true}}"
  show-edit-actions="{{true}}"
  bind:complete="onTaskComplete"
  bind:edit="onTaskEdit"
  bind:delete="onTaskDelete">
</task-item>
```

### 3. 任务数据格式

```javascript
const taskData = {
  _id: "task_id",
  name: "按时完成作业",
  description: "每天按时完成学校布置的作业，保持良好的学习习惯",
  points: 15,
  
  // 分类信息
  difficulty: "medium",        // easy, medium, hard
  taskType: "daily",          // daily, weekly, monthly, once
  category: "study",          // study, life, sport, health, etc.
  ageGroup: "primary",        // preschool, primary, middle, high

  
  // 习惯标签
  habitTags: ["学习", "自律"],
  
  // 挑战信息
  challengeTarget: {
    days: 10,
    description: "连续10天按时完成"
  },
  challengeReward: {
    points: 50,
    description: "额外奖励50积分"
  },
  
  // 完成状态
  isCompleted: false,
  completionStatus: "pending", // completed, pending
  completionRecord: {
    _id: "record_id",
    completeDate: "2025-09-17T05:34:29.001Z",
    status: "completed"
  },
  
  // 操作提示
  tips: "建议设置固定的作业时间，创造安静的学习环境",
  
  // 模板信息
  sourceTemplateId: "template_id",
  sourcePackageGroup: "general_boy"
};
```

## 事件处理

### 组件事件

```javascript
Page({
  // 任务完成
  onTaskComplete(e) {
    const task = e.detail.task;
    console.log('完成任务:', task);
    // 调用API完成任务
  },
  
  // 任务点击
  onTaskTap(e) {
    const { task, expanded } = e.detail;
    console.log('点击任务:', task, '展开状态:', expanded);
  },
  
  // 显示提示
  onShowTips(e) {
    const { task, tips } = e.detail;
    console.log('显示提示:', tips);
  },
  
  // 编辑任务
  onTaskEdit(e) {
    const task = e.detail.task;
    // 跳转到编辑页面
    wx.navigateTo({
      url: `/pages/task-edit/task-edit?id=${task._id}`
    });
  },
  
  // 删除任务
  onTaskDelete(e) {
    const task = e.detail.task;
    // 调用API删除任务
  }
});
```

## 样式定制

### 主题色彩
组件使用项目统一的渐变色主题：
- 主色调：`#667eea` → `#764ba2`
- 成功色：`#28a745`
- 警告色：`#ffc107`
- 危险色：`#dc3545`

### 响应式设计
组件支持不同屏幕尺寸的自适应显示，在小屏幕设备上会自动调整布局。

## 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| task | Object | {} | 任务数据对象 |
| showActions | Boolean | true | 是否显示操作按钮 |
| showEditActions | Boolean | false | 是否显示编辑操作按钮 |

## 更新日志

### v2.0.0 (2025-09-17)
- ✨ 全新的视觉设计，支持更丰富的信息展示
- 🏆 新增挑战系统支持，包含进度条和奖励显示
- 🎨 优化标签系统，支持难度、类型、类别等多种标签
- 💡 新增操作提示功能
- 📱 改进响应式设计，更好的移动端体验
- 🔧 重构组件逻辑，提供更多自定义选项

### v1.0.0
- 基础任务卡片功能