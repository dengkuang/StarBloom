# 数据管理架构迁移指南

## 重构后的变更

### 1. 文件变更
- ✅ **保留**: `utils/businessDataManager.js` (增强版)
- ✅ **保留**: `utils/global-child-manager.js` (重构版)
- ✅ **保留**: `utils/page-mixins.js` (优化版)
- ❌ **删除**: `utils/data-manager.js` (功能重复)

### 2. 导入语句更新

#### 原有导入方式
```javascript
// ❌ 旧方式 - 已删除的文件
const { businessDataManager } = require('../../utils/data-manager.js');

// ❌ 旧方式 - 直接使用 wx.setStorageSync
wx.setStorageSync('currentChild', child);
```

#### 新的导入方式
```javascript
// ✅ 新方式 - 核心数据管理
const businessDataManager = require('../../utils/businessDataManager.js');

// ✅ 新方式 - 全局状态管理
const { globalChildManager } = require('../../utils/global-child-manager.js');

// ✅ 新方式 - 页面混入
const { createPageWithChildManager } = require('../../utils/page-mixins.js');
```

### 3. API 变更对照表

| 功能 | 旧 API | 新 API |
|------|--------|--------|
| 设置用户信息 | `wx.setStorageSync('userInfo', data)` | `businessDataManager.setUserInfo(data)` |
| 获取用户信息 | `wx.getStorageSync('userInfo')` | `businessDataManager.getUserInfo()` |
| 设置当前孩子 | `wx.setStorageSync('currentChild', child)` | `businessDataManager.setCurrentChild(child)` |
| 获取当前孩子 | `wx.getStorageSync('currentChild')` | `businessDataManager.getCurrentChild()` |
| 初始化孩子状态 | `businessDataManager.initChildState()` | `globalChildManager.initChildState()` |
| 切换孩子 | `businessDataManager.switchChild()` | `globalChildManager.switchChild()` |

### 4. 页面更新指南

#### 首页 (pages/index/index.js)
```javascript
// 需要添加的导入
const { globalChildManager } = require('../../utils/global-child-manager.js');

// 需要更新的方法调用
// 旧: businessDataManager.initChildState(childrenList)
// 新: globalChildManager.initChildState(childrenList)

// 旧: businessDataManager.switchChild(childrenList, index)
// 新: globalChildManager.switchChild(childrenList, index)

// 旧: businessDataManager.getCurrentChild()
// 新: globalChildManager.getCurrentState().currentChild
```

#### 孩子页面 (pages/child/child.js)
```javascript
// 需要添加的导入
const { globalChildManager } = require('../../utils/global-child-manager.js');

// 页面已使用 createPageWithChildManager，但需要更新内部调用
// 旧: this.switchChild(index)
// 新: globalChildManager.switchChild(this.data.childrenList, index)

// 旧: businessDataManager.initChildState(childrenList)
// 新: globalChildManager.initChildState(childrenList)
```

### 5. 其他可能需要更新的页面

检查以下页面是否使用了旧的 API：
- `pages/tasks/tasks.js`
- `pages/rewards/rewards.js`
- `pages/parent/parent.js`
- `pages/analysis/analysis.js`

### 6. 手动修复步骤

#### 步骤 1: 添加必要的导入
在需要使用全局状态管理的页面顶部添加：
```javascript
const { globalChildManager } = require('../../utils/global-child-manager.js');
```

#### 步骤 2: 替换 API 调用
使用查找替换功能：
- 查找: `businessDataManager.initChildState`
- 替换: `globalChildManager.initChildState`

- 查找: `businessDataManager.switchChild`
- 替换: `globalChildManager.switchChild`

#### 步骤 3: 更新状态获取
```javascript
// 旧方式
const currentChild = businessDataManager.getCurrentChild();
const currentChildIndex = businessDataManager.getCurrentChildIndex();

// 新方式
const state = globalChildManager.getCurrentState();
const currentChild = state.currentChild;
const currentChildIndex = state.currentChildIndex;
```

#### 步骤 4: 使用页面混入
对于新页面，推荐使用页面混入：
```javascript
const { createPageWithChildManager } = require('../../utils/page-mixins.js');

Page(createPageWithChildManager({
  onLoad() {
    this.initGlobalChildState(); // 自动初始化
  },
  
  onGlobalChildStateChanged(child, index) {
    // 孩子状态变化回调
    console.log('孩子切换到:', child?.name);
  }
}));
```

### 7. 验证迁移

#### 检查清单
- [ ] 所有 `require('../../utils/data-manager.js')` 已移除
- [ ] 所有直接的 `wx.setStorageSync` 调用已替换为 `businessDataManager` 方法
- [ ] 孩子状态管理使用 `globalChildManager`
- [ ] 页面使用了适当的混入函数
- [ ] 导入语句正确

#### 测试要点
1. **数据持久化**: 切换页面后数据是否保持
2. **状态同步**: 在一个页面切换孩子，其他页面是否同步更新
3. **缓存性能**: 重复访问数据是否从缓存读取
4. **错误处理**: 网络错误时是否有合适的降级处理

### 8. 常见问题

#### Q: 为什么导入语句被自动删除？
A: 可能是编辑器或构建工具的自动优化。请手动添加必要的导入语句。

#### Q: 页面混入和直接调用有什么区别？
A: 页面混入提供了更完整的状态管理和事件处理，推荐使用。直接调用适合简单场景。

#### Q: 如何处理缓存过期？
A: 新的 `businessDataManager` 有自动过期机制，无需手动处理。

#### Q: 旧数据如何迁移？
A: 新系统会自动从本地存储读取旧数据，无需手动迁移。

### 9. 性能优化建议

1. **合理设置缓存时间**
   ```javascript
   businessDataManager.setUserInfo(userInfo, 600000); // 10分钟
   businessDataManager.setTaskList(tasks, 180000);    // 3分钟
   ```

2. **使用事件监听减少轮询**
   ```javascript
   businessDataManager.on('currentChild:changed', (child) => {
     // 响应孩子切换事件
   });
   ```

3. **批量操作优化**
   ```javascript
   // 批量设置数据
   businessDataManager.set('key1', data1);
   businessDataManager.set('key2', data2);
   businessDataManager.set('key3', data3);
   ```

这个迁移指南确保了所有页面都能正确使用新的数据管理架构。