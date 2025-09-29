# 字典管理系统使用指南

## 概述

本项目已实现统一的字典管理系统，解决了之前奖励类型等字典数据在代码中硬编码的问题。现在所有字典数据都存储在云数据库中，并通过缓存机制提高访问性能。

## 系统架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   前端页面/组件   │ -> │  字典管理器       │ -> │   云数据库       │
│                │    │ (缓存 + API)     │    │ (dictionaries)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 核心文件

### 1. 字典管理器 (`utils/dictionary-manager.js`)
- 提供统一的字典访问接口
- 实现本地缓存机制
- 支持批量加载和单个获取

### 2. 云函数 (`cloudfunctions/manageDictionary/`)
- 处理字典的CRUD操作
- 支持按分类查询和批量获取
- 提供缓存刷新功能

### 3. API服务 (`utils/api-services.js`)
- 封装云函数调用
- 提供标准化的API接口

## 使用方法

### 基础用法

```javascript
const dictionaryManager = require('../utils/dictionary-manager.js')

// 获取奖励类型选项
const rewardTypes = await dictionaryManager.getRewardTypeOptions()
// 返回: [{ value: 'physical', label: '实物奖励' }, ...]

// 获取奖励类型名称
const typeName = dictionaryManager.getRewardTypeName('physical')
// 返回: '实物奖励'

// 验证奖励类型是否有效
const isValid = dictionaryManager.isValidRewardType('physical')
// 返回: true
```

### 在页面中使用

```javascript
Page({
  data: {
    rewardTypes: [],
    selectedType: ''
  },

  async onLoad() {
    // 加载奖励类型选项
    const rewardTypes = await dictionaryManager.getRewardTypeOptions()
    this.setData({ rewardTypes })
  },

  onTypeChange(e) {
    const value = e.detail.value
    this.setData({ selectedType: value })
    
    // 获取选中类型的显示名称
    const typeName = dictionaryManager.getRewardTypeName(value)
    console.log('选中类型:', typeName)
  }
})
```

### 批量加载字典

```javascript
// 一次性加载多个字典
await dictionaryManager.batchLoadDictionaries([
  'task_type',
  'cycle_type', 
  'reward_type'
])

// 现在可以同步获取所有字典
const taskTypes = dictionaryManager.getTaskTypeOptions()

const rewardTypes = dictionaryManager.getRewardTypeOptions()
```

## 可用的字典类型

### 1. 奖励类型 (reward_type)
- `physical`: 实物奖励
- `privilege`: 特权奖励  
- `experience`: 体验奖励
- `virtual`: 虚拟奖励
- `charity`: 公益奖励

### 2. 任务类型 (task_type)
- `daily`: 每日任务
- `weekly`: 每周任务
- `monthly`: 每月任务

### 3. 周期类型 (cycle_type)
- `daily`: 每日
- `weekly`: 每周
- `monthly`: 每月

## API 方法

### 字典管理器方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `getRewardTypeOptions()` | 获取奖励类型选项 | `Array<{value, label}>` |
| `getTaskTypeOptions()` | 获取任务类型选项 | `Array<{value, label}>` |
| `getCycleTypeOptions()` | 获取周期类型选项 | `Array<{value, label}>` |
| `getRewardTypeName(value)` | 获取奖励类型名称 | `string` |
| `getTaskTypeName(value)` | 获取任务类型名称 | `string` |
| `isValidRewardType(value)` | 验证奖励类型 | `boolean` |
| `isValidTaskType(value)` | 验证任务类型 | `boolean` |
| `batchLoadDictionaries(categories)` | 批量加载字典 | `Promise` |
| `clearCache()` | 清除缓存 | `void` |

### 云函数 API

| Action | 说明 | 参数 |
|--------|------|------|
| `getByCategory` | 按分类获取字典 | `category` |
| `getAllCategories` | 获取所有分类 | 无 |
| `batchGet` | 批量获取字典 | `categories[]` |
| `add` | 添加字典项 | `data` |
| `update` | 更新字典项 | `id, data` |
| `delete` | 删除字典项 | `id` |

## 部署步骤

### 1. 部署云函数

```bash
# 使用TCB CLI
tcb functions:deploy manageDictionary

# 或使用微信开发者工具上传云函数
```

### 2. 验证部署

```javascript
// 运行验证脚本
node scripts/deploy-dictionary-function.js
```

### 3. 初始化数据

确保数据库中有必要的字典数据，特别是奖励类型字典。

## 缓存机制

- **本地缓存**: 字典数据会缓存在内存中，避免重复请求
- **缓存时效**: 缓存在应用生命周期内有效
- **缓存刷新**: 可通过 `clearCache()` 方法清除缓存

## 迁移指南

### 从硬编码到字典系统

**之前的代码:**
```javascript
const rewardTypes = [
  { value: 'physical', label: '实物奖励' },
  { value: 'privilege', label: '特权奖励' }
]
```

**迁移后的代码:**
```javascript
const rewardTypes = await dictionaryManager.getRewardTypeOptions()
```

### 更新现有页面

1. 引入字典管理器
2. 在 `onLoad` 中加载字典数据
3. 替换硬编码的选项数组
4. 使用字典管理器的验证和转换方法

## 最佳实践

### 1. 预加载常用字典
```javascript
// 在 app.js 中预加载
App({
  async onLaunch() {
    // 预加载常用字典
    await dictionaryManager.batchLoadDictionaries([
      'task_type', 'reward_type', 'cycle_type'
    ])
  }
})
```

### 2. 错误处理
```javascript
try {
  const rewardTypes = await dictionaryManager.getRewardTypeOptions()
  this.setData({ rewardTypes })
} catch (error) {
  console.error('加载字典失败:', error)
  // 使用默认值或显示错误提示
}
```

### 3. 性能优化
```javascript
// 避免重复加载，先检查缓存
if (!dictionaryManager.hasCache('reward_type')) {
  await dictionaryManager.getRewardTypeOptions()
}
```

## 故障排除

### 常见问题

1. **字典数据为空**
   - 检查云函数是否正确部署
   - 确认数据库中有对应的字典数据

2. **缓存不生效**
   - 检查是否正确调用了加载方法
   - 确认没有意外清除缓存

3. **API调用失败**
   - 检查网络连接
   - 确认云函数权限配置

### 调试方法

```javascript
// 开启调试模式
dictionaryManager.setDebugMode(true)

// 查看缓存状态
console.log('缓存状态:', dictionaryManager.getCacheStatus())

// 测试API连接
const result = await dictionaryApi.getAllCategories()
console.log('API测试结果:', result)
```

## 总结

通过实施统一的字典管理系统，我们实现了：

1. ✅ **数据统一**: 所有字典数据存储在数据库中
2. ✅ **缓存优化**: 减少重复的网络请求
3. ✅ **易于维护**: 集中管理字典数据和逻辑
4. ✅ **类型安全**: 提供验证和转换方法
5. ✅ **向后兼容**: 平滑迁移现有代码

现在整个项目中的奖励类型定义已经统一，所有相关功能都通过字典管理器来获取和使用字典数据。