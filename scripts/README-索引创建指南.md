# 数据库索引创建指南

## 概述

本指南说明如何为 StarBloom 项目创建推荐的数据库索引，以优化查询性能。

## 索引设计原理

### 1. 查询模式分析
- **用户维度查询**: 家长查询自己的数据（孩子、任务、奖励等）
- **时间序列查询**: 按时间倒序查询记录（积分记录、兑换记录等）
- **状态筛选查询**: 查询有效/无效的数据
- **分类筛选查询**: 按年龄组、分类等筛选模板

### 2. 索引优化策略
- **复合索引**: 将常用的查询条件组合成复合索引
- **排序优化**: 为时间字段创建降序索引
- **唯一约束**: 为业务唯一字段创建唯一索引
- **覆盖索引**: 尽可能让索引覆盖查询所需的所有字段

## 推荐索引列表

### 核心业务索引

#### users 集合
- `openid_1` (唯一): 用户登录查询优化

#### children 集合  
- `parentId_1`: 家长查询自己的孩子

#### tasks 集合
- `parentId_status_1`: 家长查询自己的有效任务
- `childIds_status_1`: 查询分配给特定孩子的有效任务

#### task_completion_records 集合
- `taskId_childId_1`: 查询特定任务的完成情况
- `childId_completeDate_-1`: 查询孩子的完成历史（按时间倒序）

#### point_records 集合
- `childId_recordTime_-1`: 查询孩子的积分变动历史
- `childId_changeType_recordTime_-1`: 按变动类型查询积分记录

#### rewards 集合
- `parentId_status_1`: 家长查询自己的有效奖励
- `pointsRequired_status_1`: 按积分范围查询奖励

#### exchange_records 集合
- `childId_exchangeTime_-1`: 查询孩子的兑换历史
- `parentId_status_exchangeTime_-1`: 家长管理兑换记录

### 模板系统索引

#### task_templates 集合
- `isActive_ageGroup_category_1`: 模板筛选优化
- `createBy_isActive_1`: 查询用户自定义模板

#### reward_templates 集合
- `isActive_ageGroup_category_1`: 模板筛选优化
- `isActive_pointsRequired_1`: 按积分范围筛选模板

### 字典系统索引

#### dictionaries 集合
- `category_is_active_1`: 字典数据查询优化

## 创建方法

### 方法一：云开发控制台（推荐）

1. 打开微信开发者工具
2. 进入云开发控制台
3. 选择"数据库"
4. 在控制台中执行以下代码：

```javascript
// 复制 scripts/create-database-indexes.js 中的代码到控制台

// 创建所有推荐索引
await createAllIndexes()

// 查询现有索引
await listAllIndexes()
```

### 方法二：云函数方式

如果需要通过云函数创建索引，可以部署 `cloudfunctions/manageIndexes` 云函数：

```javascript
// 调用云函数创建所有索引
wx.cloud.callFunction({
  name: 'manageIndexes',
  data: {
    action: 'createAllIndexes'
  }
})
```

## 性能监控

### 查询性能指标
- **查询时间**: 目标 < 100ms
- **扫描文档数**: 应接近返回文档数
- **索引命中率**: 应 > 95%

### 监控方法
1. 使用云开发控制台的性能监控
2. 在代码中添加查询时间统计
3. 定期检查慢查询日志

## 维护建议

### 定期检查
- 每月检查索引使用情况
- 监控查询性能变化
- 根据新的查询模式调整索引

### 索引优化
- 删除未使用的索引
- 合并相似的索引
- 根据数据增长调整索引策略

## 注意事项

1. **索引开销**: 每个索引都会增加写入开销，需要平衡查询性能和写入性能
2. **存储成本**: 索引会占用额外存储空间
3. **更新维护**: 数据结构变化时需要相应更新索引
4. **测试验证**: 创建索引后需要测试查询性能改善效果

## 故障排除

### 常见问题
1. **索引创建失败**: 检查字段名称和数据类型
2. **查询仍然很慢**: 检查查询条件是否匹配索引
3. **索引未生效**: 确认查询使用了正确的字段顺序

### 解决方案
1. 使用 `explain()` 方法分析查询执行计划
2. 检查索引统计信息
3. 重新创建问题索引