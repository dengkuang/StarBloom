# 数据管理架构重构说明

## 架构概览

重构后的数据管理架构分为三层：

```
页面层 (page-mixins.js)
    ↓
状态管理层 (global-child-manager.js)
    ↓
数据管理层 (businessDataManager.js)
```

## 核心文件说明

### 1. businessDataManager.js - 核心数据管理层
- **职责**：纯数据存储、缓存管理、事件通知
- **特性**：内存缓存 + 本地存储、自动过期、事件系统
- **使用**：单例模式，全局共享

### 2. global-child-manager.js - 全局状态管理层
- **职责**：孩子状态管理、页面间状态同步
- **特性**：状态初始化、切换通知、事件分发
- **使用**：提供混入和高阶函数

### 3. page-mixins.js - 页面混入层
- **职责**：页面级功能混入、业务逻辑封装
- **特性**：任务管理、奖励管理、缓存优化
- **使用**：页面增强函数

## 使用示例

### 基础页面使用
```javascript
// pages/example/example.js
const { createPageWithChildManager } = require('../../utils/page-mixins.js');

Page(createPageWithChildManager({
  data: {
    // 页面自定义数据
  },

  onLoad: function() {
    // 初始化全局孩子状态
    this.initGlobalChildState();
  },

  // 孩子状态变化回调
  onGlobalChildStateChanged: function(child, index) {
    console.log('孩子状态变化:', child?.name, index);
    // 重新加载页面数据
    this.loadPageData();
  }
}));
```

### 任务页面使用
```javascript
// pages/tasks/tasks.js
const { createTaskPage } = require('../../utils/page-mixins.js');

Page(createTaskPage({
  data: {
    // 页面自定义数据
  },

  onLoad: function() {
    // 初始化状态并加载任务
    this.initGlobalChildState();
    this.loadTaskList(); // 自动缓存优化
  },

  onGlobalChildStateChanged: function(child, index) {
    // 孩子切换时自动重新加载任务
    console.log('切换到孩子:', child?.name);
  }
}));
```

### 奖励页面使用
```javascript
// pages/rewards/rewards.js
const { createRewardPage } = require('../../utils/page-mixins.js');

Page(createRewardPage({
  data: {
    // 页面自定义数据
  },

  onLoad: function() {
    this.initGlobalChildState();
    this.loadRewardList(); // 自动缓存优化
  }
}));
```

### 直接使用数据管理器
```javascript
const businessDataManager = require('../../utils/businessDataManager.js');

// 设置用户信息（10分钟缓存）
businessDataManager.setUserInfo(userInfo);

// 获取用户信息（优先从缓存）
const userInfo = businessDataManager.getUserInfo();

// 监听数据变化
businessDataManager.on('userInfo:changed', (newUserInfo) => {
  console.log('用户信息更新:', newUserInfo);
});
```

### 全局孩子状态管理
```javascript
const { globalChildManager } = require('../../utils/global-child-manager.js');

// 初始化孩子状态
const state = globalChildManager.initChildState(childrenList);

// 切换孩子
globalChildManager.switchChild(childrenList, 1);

// 监听孩子状态变化
globalChildManager.onChildStateChange(({ child, index }) => {
  console.log('全局孩子状态变化:', child?.name, index);
});
```

## 重构优势

### 1. **消除重复代码**
- 删除了重复的 `data-manager.js`
- 统一了数据管理接口

### 2. **性能优化**
- 内存缓存优先，减少磁盘 I/O
- 自动过期机制，避免过期数据
- 批量操作支持

### 3. **架构清晰**
- 职责分离明确
- 依赖关系清晰
- 易于维护和扩展

### 4. **开发体验**
- 统一的 API 接口
- 自动缓存管理
- 事件驱动更新

## 迁移指南

### 原有代码迁移
```javascript
// 旧代码
const { businessDataManager } = require('../../utils/data-manager.js');
wx.setStorageSync('currentChild', child);

// 新代码
const businessDataManager = require('../../utils/businessDataManager.js');
businessDataManager.setCurrentChild(child);
```

### 页面增强迁移
```javascript
// 旧代码
Page({
  onLoad() {
    // 手动管理孩子状态
  }
});

// 新代码
const { createPageWithChildManager } = require('../../utils/page-mixins.js');
Page(createPageWithChildManager({
  onLoad() {
    this.initGlobalChildState(); // 自动管理
  }
}));
```

## 注意事项

1. **单例使用**：`businessDataManager` 是单例，全局共享
2. **事件清理**：页面销毁时记得移除事件监听
3. **缓存过期**：合理设置缓存过期时间
4. **错误处理**：所有操作都有错误处理机制

这样的重构提供了更好的性能、更清晰的架构和更好的开发体验。