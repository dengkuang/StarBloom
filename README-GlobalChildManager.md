# 全局孩子状态管理系统

## 概述

为了确保在不同页面间保持孩子选择的一致性，我们实现了一个全局孩子状态管理系统。当用户在首页切换孩子后，其他页面（如任务管理、奖励管理等）会自动同步显示对应孩子的信息。

## 核心组件

### 1. BusinessDataManager (utils/businessDataManager.js)

增强的业务数据管理器，提供全局孩子状态管理功能：

- `setCurrentChild(child)` - 设置当前选中的孩子
- `getCurrentChild()` - 获取当前选中的孩子
- `setCurrentChildIndex(index)` - 设置当前孩子索引
- `getCurrentChildIndex()` - 获取当前孩子索引
- `switchChild(childrenList, index)` - 全局切换孩子
- `initChildState(childrenList)` - 初始化孩子状态
- `notifyChildChanged(child, index)` - 通知孩子切换事件

### 2. GlobalChildManager (utils/global-child-manager.js)

全局孩子状态管理工具，提供页面混入功能：

- `GlobalChildManagerMixin` - 页面混入对象
- `withGlobalChildManager(pageOptions)` - 为页面添加全局状态管理

### 3. PageMixins (utils/page-mixins.js)

页面混入工具集合，提供便捷的页面创建方法：

- `createPageWithChildManager()` - 创建带全局状态管理的页面
- `createTaskPage()` - 创建任务管理页面
- `createRewardPage()` - 创建奖励管理页面

## 使用方法

### 方法一：使用页面混入工具

```javascript
// pages/tasks/tasks.js
const { createTaskPage } = require('../../utils/page-mixins.js');

Page(createTaskPage({
  data: {
    // 页面自定义数据
  },

  onLoad: function() {
    // 初始化全局孩子状态
    this.initGlobalChildState();
    // 加载任务列表（混入会自动处理孩子切换）
    this.loadTaskList();
  },

  // 自定义孩子状态变化回调（可选）
  onGlobalChildStateChanged: function(child, index) {
    console.log('当前孩子切换到:', child.name);
    // 可以在这里添加额外的处理逻辑
  }
}));
```

### 方法二：手动集成

```javascript
// pages/example/example.js
const { withGlobalChildManager } = require('../../utils/global-child-manager.js');

Page(withGlobalChildManager({
  data: {
    // 页面数据
  },

  onLoad: function() {
    // 初始化全局孩子状态
    const { currentChild, currentChildIndex } = this.initGlobalChildState();
    console.log('当前孩子:', currentChild);
  },

  // 孩子状态变化回调
  onGlobalChildStateChanged: function(child, index) {
    // 重新加载页面数据
    this.loadPageData();
  },

  // 切换孩子
  switchChild: function(index) {
    const childrenList = this.getChildrenList();
    this.switchGlobalChild(childrenList, index);
  }
}));
```

### 方法三：传统方式（手动实现）

```javascript
// pages/manual/manual.js
const businessDataManager = require('../../utils/businessDataManager.js');

Page({
  data: {
    currentChild: null,
    currentChildIndex: 0
  },

  onLoad: function() {
    // 获取全局状态
    const currentChild = businessDataManager.getCurrentChild();
    const currentChildIndex = businessDataManager.getCurrentChildIndex();
    
    this.setData({ currentChild, currentChildIndex });
  },

  onShow: function() {
    // 同步全局状态
    this.syncGlobalChildState();
  },

  // 监听全局孩子切换事件
  onChildChanged: function(child, index) {
    this.setData({
      currentChild: child,
      currentChildIndex: index
    });
    // 重新加载数据
    this.loadPageData();
  },

  syncGlobalChildState: function() {
    const globalCurrentChild = businessDataManager.getCurrentChild();
    if (globalCurrentChild && 
        (!this.data.currentChild || this.data.currentChild._id !== globalCurrentChild._id)) {
      this.setData({ currentChild: globalCurrentChild });
      this.loadPageData();
    }
  }
});
```

## 事件机制

系统使用事件通知机制来同步不同页面的状态：

1. 当用户在任何页面切换孩子时，`businessDataManager.switchChild()` 会被调用
2. 该方法会更新全局状态并调用 `notifyChildChanged()` 
3. `notifyChildChanged()` 会遍历当前所有页面，调用每个页面的 `onChildChanged()` 方法
4. 各页面收到通知后，会更新自己的状态并重新加载数据

## 数据持久化

- 使用微信小程序的 `wx.setStorageSync()` 和 `wx.getStorageSync()` 进行本地存储
- 当前孩子信息和索引会同时保存在内存缓存和本地存储中
- 应用重启后能够恢复上次选择的孩子状态

## 最佳实践

1. **页面初始化**：在 `onLoad` 中调用 `initGlobalChildState()`
2. **状态同步**：在 `onShow` 中调用 `syncGlobalChildState()`
3. **事件监听**：实现 `onChildChanged()` 方法来响应孩子切换
4. **数据加载**：在孩子状态变化时重新加载相关数据
5. **错误处理**：妥善处理孩子不存在或索引无效的情况

## 注意事项

- 确保在使用全局状态前先调用初始化方法
- 页面销毁时不需要手动清理，系统会自动处理
- 如果页面有特殊的孩子选择逻辑，可以重写相关方法
- 建议在关键操作前检查当前孩子是否存在

## 调试

可以通过以下方式查看全局状态：

```javascript
// 获取当前孩子
const currentChild = businessDataManager.getCurrentChild();
console.log('当前孩子:', currentChild);

// 获取当前索引
const currentIndex = businessDataManager.getCurrentChildIndex();
console.log('当前索引:', currentIndex);

// 获取孩子列表
const childrenList = businessDataManager.getChildrenList();
console.log('孩子列表:', childrenList);