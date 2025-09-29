# StarBloom 项目结构设置设计文档

## 1. 概述

本文档描述了 StarBloom 儿童积分奖励系统微信小程序的项目结构设置，包括目录结构、核心文件配置、组件设计和云函数架构等内容。该项目基于微信小程序原生框架配合云开发 Serverless 架构，旨在为家长提供儿童行为激励管理功能。

## 2. 项目架构

### 2.1 技术架构
- **前端框架**: 微信小程序原生框架 (WXML/WXSS/JavaScript)
- **后端架构**: 微信云开发 Serverless 架构
- **数据库**: 微信云数据库 (NoSQL)
- **文件存储**: 微信云存储
- **主题色**: 绿色系 (#4CAF50)

### 2.2 项目结构概览
```
StarBloom/
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
│   ├── templates/                  # 预设模板管理
│   └── template-management/        # 模板管理
├── utils/                          # 工具类目录
│   ├── api-client.js               # API客户端
│   ├── api-services.js             # API服务层
│   ├── data-manager.js             # 数据管理器
│   └── util.js                     # 工具函数
├── cloudfunctions/                 # 云函数目录
│   ├── getUserInfo/                # 用户信息管理
│   ├── manageChildren/             # 儿童信息管理
│   ├── manageTasks/                # 任务管理
│   ├── manageRewards/              # 奖励管理
│   ├── managePoints/               # 积分系统管理
│   ├── dataAnalysis/               # 数据分析
│   ├── manageDictionary/           # 字典管理
│   ├── manageTemplates/            # 预设模板管理
│   ├── manageTemplateData/         # 模板数据管理
│   ├── importExportTemplates/      # 模板导入导出功能
│   ├── initDatabase/               # 数据库初始化
│   └── initDefaultRewards/         # 默认奖励初始化
├── components/                     # 自定义组件
│   ├── child-card/                 # 儿童卡片组件
│   ├── reward-item/                # 奖励项组件
│   ├── stat-card/                  # 统计卡片组件
│   ├── task-item/                  # 任务项组件
│   └── template-card/              # 模板卡片组件
├── images/                         # 图片资源
└── scripts/                        # 脚本工具
```

## 3. 核心应用文件设计

### 3.1 app.js - 应用入口文件
```javascript
// 应用入口文件
App({
  globalData: {
    userInfo: null,
    currentChild: null,
    childrenList: []
  },

  onLaunch: function () {
    // 小程序初始化时执行
    console.log('StarBloom app launched');
  },

  onShow: function () {
    // 小程序启动，或从后台进入前台显示时执行
    console.log('StarBloom app shown');
  },

  onHide: function () {
    // 小程序从前台进入后台时执行
    console.log('StarBloom app hidden');
  }
});
```

### 3.2 app.json - 应用配置文件
```json
{
  "pages": [
    "pages/index/index",
    "pages/parent/parent",
    "pages/child/child",
    "pages/tasks/tasks",
    "pages/rewards/rewards",
    "pages/points/points",
    "pages/analysis/analysis",
    "pages/settings/settings",
    "pages/dictionary/dictionary",
    "pages/templates/templates",
    "pages/template-management/template-management"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#4CAF50",
    "navigationBarTitleText": "StarBloom",
    "navigationBarTextStyle": "white"
  },
  "sitemapLocation": "sitemap.json"
}
```

### 3.3 app.wxss - 全局样式文件
```css
/* 全局样式文件 */
/* 遵循用户偏好的界面颜色偏好：使用绿色作为界面主题色 */
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  box-sizing: border-box;
}



## 4. 页面结构设计

### 4.1 页面目录结构
项目包含以下11个主要功能页面：
1. 首页 (index) - 系统入口，用户登录注册，首页概览
2. 家长管理 (parent) - 家长专用管理功能
3. 儿童视图 (child) - 儿童专用游戏化界面
4. 任务管理 (tasks) - 任务的查看、管理和完成
5. 奖励商店 (rewards) - 奖励浏览和兑换
6. 积分中心 (points) - 积分记录和统计
7. 数据分析 (analysis) - 综合数据分析和报告
8. 系统设置 (settings) - 系统设置和用户偏好
9. 字典配置 (dictionary) - 统一字典数据配置和管理
10. 预设模板 (templates) - 提供适合不同年龄段儿童的预设任务和奖励模板
11. 模板管理 (template-management) - 专门用于维护任务模板和兑换奖励模板的管理页面

### 4.2 页面文件结构
每个页面目录包含以下基础文件：
- `.js` - 页面逻辑文件
- `.wxml` - 页面结构文件
- `.wxss` - 页面样式文件

例如，首页页面结构：
```
index/
├── index.js      # 页面逻辑
├── index.wxml    # 页面结构
└── index.wxss    # 页面样式
```

## 5. 组件设计

### 5.1 组件目录结构
项目包含以下5个核心自定义组件：
1. child-card - 儿童卡片组件
2. reward-item - 奖励项组件
3. stat-card - 统计卡片组件
4. task-item - 任务项组件
5. template-card - 模板卡片组件

### 5.2 组件文件结构
每个组件目录包含以下基础文件：
- `.js` - 组件逻辑文件
- `.json` - 组件配置文件
- `.wxml` - 组件结构文件
- `.wxss` - 组件样式文件

例如，儿童卡片组件结构：
```
child-card/
├── child-card.js      # 组件逻辑
├── child-card.json    # 组件配置
├── child-card.wxml    # 组件结构
└── child-card.wxss    # 组件样式
```

### 5.3 组件实现

#### 5.3.1 儿童卡片组件 (child-card)
```javascript
// components/child-card/child-card.js
// 儿童卡片组件逻辑
Component({
  options: {
    addGlobalClass: true
  },
  
  properties: {
    child: {
      type: Object,
      value: {}
    },
    showActions: {
      type: Boolean,
      value: false
    }
  },
  
  data: {
  },
  
  methods: {
    // 点击儿童卡片
    onTap: function() {
      this.triggerEvent('tap', { child: this.data.child });
    },
    
    // 编辑儿童信息
    onEdit: function() {
      this.triggerEvent('edit', { child: this.data.child });
    },
    
    // 删除儿童
    onDelete: function() {
      this.triggerEvent('delete', { child: this.data.child });
    }
  }
});
```

```xml
<!-- components/child-card/child-card.wxml -->
<!-- 儿童卡片组件结构 -->
<view class="child-card" bindtap="onTap">
  <image class="child-avatar" src="{{child.avatar || '/images/default-avatar.png'}}" mode="aspectFill"></image>
  <view class="child-info">
    <text class="child-name">{{child.name}}</text>
    <text class="child-age">{{child.age}}岁</text>
    <text class="child-points">积分: {{child.totalPoints}}</text>
  </view>
  
  <view wx:if="{{showActions}}" class="child-actions">
    <button class="action-btn edit-btn" bindtap="onEdit">编辑</button>
    <button class="action-btn delete-btn" bindtap="onDelete">删除</button>
  </view>
</view>
```

```css
/* components/child-card/child-card.wxss */
/* 儿童卡片组件样式 */
.child-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: white;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
  margin: 20rpx;
}

.child-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 30rpx;
}

.child-info {
  flex: 1;
}

.child-name {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.child-age, .child-points {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.child-actions {
  display: flex;
  flex-direction: column;
}

.action-btn {
  margin: 5rpx 0;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  border-radius: 5rpx;
}

.edit-btn {
  background-color: #4CAF50;
  color: white;
}

.delete-btn {
  background-color: #F44336;
  color: white;
}
```

#### 5.3.2 任务项组件 (task-item)
```javascript
// components/task-item/task-item.js
// 任务项组件逻辑
Component({
  options: {
    addGlobalClass: true
  },
  
  properties: {
    task: {
      type: Object,
      value: {}
    },
    showActions: {
      type: Boolean,
      value: true
    }
  },
  
  data: {
  },
  
  methods: {
    // 完成任务
    onComplete: function() {
      this.triggerEvent('complete', { task: this.data.task });
    },
    
    // 编辑任务
    onEdit: function() {
      this.triggerEvent('edit', { task: this.data.task });
    },
    
    // 删除任务
    onDelete: function() {
      this.triggerEvent('delete', { task: this.data.task });
    }
  }
});
```

#### 5.3.3 奖励项组件 (reward-item)
```javascript
// components/reward-item/reward-item.js
// 奖励项组件逻辑
Component({
  options: {
    addGlobalClass: true
  },
  
  properties: {
    reward: {
      type: Object,
      value: {}
    },
    showActions: {
      type: Boolean,
      value: true
    }
  },
  
  data: {
  },
  
  methods: {
    // 兑换奖励
    onExchange: function() {
      this.triggerEvent('exchange', { reward: this.data.reward });
    },
    
    // 编辑奖励
    onEdit: function() {
      this.triggerEvent('edit', { reward: this.data.reward });
    },
    
    // 删除奖励
    onDelete: function() {
      this.triggerEvent('delete', { reward: this.data.reward });
    }
  }
});
```

#### 5.3.4 模板卡片组件 (template-card)
```javascript
// components/template-card/template-card.js
// 模板卡片组件逻辑
Component({
  options: {
    addGlobalClass: true
  },
  
  properties: {
    template: {
      type: Object,
      value: {}
    },
    type: {
      type: String,
      value: 'task' // task or reward
    }
  },
  
  data: {
  },
  
  methods: {
    // 应用模板
    onApply: function() {
      this.triggerEvent('apply', { template: this.data.template });
    },
    
    // 预览模板
    onPreview: function() {
      this.triggerEvent('preview', { template: this.data.template });
    },
    
    // 编辑模板
    onEdit: function() {
      this.triggerEvent('edit', { template: this.data.template });
    }
  }
});
```

## 6. 工具类设计

### 6.1 工具类目录结构
utils目录包含以下4个核心工具文件：
1. `api-client.js` - API客户端
2. `api-services.js` - API服务层
3. `data-manager.js` - 数据管理器
4. `util.js` - 工具函数

### 6.2 数据管理器设计
```javascript
// utils/data-manager.js
// 数据管理器
// 遵循用户偏好的统一数据管理模块偏好
const businessDataManager = {
  // 用户信息管理
  setUserInfo(userInfo) {
    wx.setStorageSync('userInfo', userInfo);
  },

  getUserInfo() {
    return wx.getStorageSync('userInfo');
  },

  // 儿童信息管理
  setCurrentChild(child) {
    wx.setStorageSync('currentChild', child);
  },

  getCurrentChild() {
    return wx.getStorageSync('currentChild');
  },

  setChildrenList(children) {
    wx.setStorageSync('childrenList', children);
  },

  getChildrenList() {
    return wx.getStorageSync('childrenList');
  },

  // 设置信息管理
  setSettings(settings) {
    const currentSettings = wx.getStorageSync('appSettings') || {};
    wx.setStorageSync('appSettings', { ...currentSettings, ...settings });
  },

  getSettings() {
    return wx.getStorageSync('appSettings') || {};
  },

  // 从全局数据同步
  syncFromGlobalData() {
    // 实现从全局数据同步的逻辑
  },

  // 清理所有数据
  clearAll() {
    wx.clearStorageSync();
  }
};

module.exports = {
  businessDataManager
};
```

## 7. 云函数架构设计

### 7.1 云函数目录结构
cloudfunctions目录包含以下12个核心云函数：
1. `getUserInfo` - 用户信息管理
2. `manageChildren` - 儿童信息管理
3. `manageTasks` - 任务管理
4. `manageRewards` - 奖励管理
5. `managePoints` - 积分系统管理
6. `dataAnalysis` - 数据分析
7. `manageDictionary` - 字典管理
8. `manageTemplates` - 预设模板管理
9. `manageTemplateData` - 模板数据管理
10. `importExportTemplates` - 模板导入导出功能
11. `initDatabase` - 数据库初始化
12. `initDefaultRewards` - 默认奖励初始化

### 7.2 云函数示例 - getUserInfo
```javascript
// cloudfunctions/getUserInfo/index.js
// 用户信息管理云函数
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, data } = event
  
  switch (action) {
    case 'get':
      return await getUserInfo(wxContext.OPENID)
    case 'update':
      return await updateUserInfo(wxContext.OPENID, data)
    default:
      return { code: -1, message: '未知操作' }
  }
}

async function getUserInfo(openid) {
  // 获取用户信息逻辑
  return { code: 0, message: 'success' }
}

async function updateUserInfo(openid, data) {
  // 更新用户信息逻辑
  return { code: 0, message: 'success' }
}
```

## 8. 数据库设计

### 8.1 核心数据表
数据库设计包含以下12张核心数据表：
1. users - 用户信息表
2. children - 儿童信息表
3. tasks - 任务表
4. task_completion_records - 任务完成记录表
5. rewards - 奖励表
6. exchange_records - 兑换记录表
7. point_records - 积分记录表
8. task_templates - 任务模板表
9. reward_templates - 奖励模板表
10. dictionaries - 字典表
11. template_usage_records - 模板使用记录表
12. template_import_export_records - 模板导入导出记录表

### 8.2 数据库索引设计
为提高查询效率，数据库设计了针对各表关键字段的索引，例如：
- children集合: parentId字段索引
- tasks集合: parentId, childIds, status字段索引
- task_templates集合: ageGroup, category, isActive, sort_order, createBy字段索引

### 8.3 数据库初始化云函数 (initDatabase)
```javascript
// cloudfunctions/initDatabase/index.js
// 数据库初始化云函数
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 默认字典数据
const defaultDictionaries = {
  task_type: [
    { category: 'task_type', code: 'daily', name: '每日任务', value: 'daily' },
    { category: 'task_type', code: 'weekly', name: '每周任务', value: 'weekly' },
    { category: 'task_type', code: 'monthly', name: '每月任务', value: 'monthly' },
    { category: 'task_type', code: 'once', name: '一次性任务', value: 'once' },
    { category: 'task_type', code: 'challenge', name: '挑战任务', value: 'challenge' }
  ],
  
  cycle_type: [
    { category: 'cycle_type', code: 'daily', name: '每日', value: 'daily' },
    { category: 'cycle_type', code: 'weekly', name: '每周', value: 'weekly' },
    { category: 'cycle_type', code: 'monthly', name: '每月', value: 'monthly' },
    { category: 'cycle_type', code: 'custom', name: '自定义', value: 'custom' }
  ],
  
  reward_type: [
    { category: 'reward_type', code: 'physical', name: '实物奖励', value: 'physical' },
    { category: 'reward_type', code: 'privilege', name: '特权奖励', value: 'privilege' },
    { category: 'reward_type', code: 'experience', name: '体验奖励', value: 'experience' },
    { category: 'reward_type', code: 'virtual', name: '虚拟奖励', value: 'virtual' },
    { category: 'reward_type', code: 'charity', name: '公益奖励', value: 'charity' }
  ],
  
  change_type: [
    { category: 'change_type', code: 'earn', name: '获得积分', value: 'earn' },
    { category: 'change_type', code: 'consume', name: '消耗积分', value: 'consume' },
    { category: 'change_type', code: 'bonus', name: '奖励积分', value: 'bonus' },
    { category: 'change_type', code: 'daily_bonus', name: '每日奖励', value: 'daily_bonus' },
    { category: 'change_type', code: 'weekly_bonus', name: '每周奖励', value: 'weekly_bonus' },
    { category: 'change_type', code: 'adjustment_add', name: '积分调增', value: 'adjustment_add' },
    { category: 'change_type', code: 'adjustment_subtract', name: '积分调减', value: 'adjustment_subtract' }
  ],
  
  task_status: [
    { category: 'task_status', code: 'active', name: '激活', value: 'active' },
    { category: 'task_status', code: 'inactive', name: '停用', value: 'inactive' },
    { category: 'task_status', code: 'completed', name: '已完成', value: 'completed' },
    { category: 'task_status', code: 'expired', name: '已过期', value: 'expired' }
  ],
  
  exchange_status: [
    { category: 'exchange_status', code: 'pending', name: '待审核', value: 'pending' },
    { category: 'exchange_status', code: 'approved', name: '已批准', value: 'approved' },
    { category: 'exchange_status', code: 'delivered', name: '已发放', value: 'delivered' },
    { category: 'exchange_status', code: 'cancelled', name: '已取消', value: 'cancelled' }
  ]
};

// 一年级默认任务模板
const grade1TaskTemplates = [
  {
    name: "按时起床（7:30前）",
    description: "小闹钟一响，立刻坐起来，不赖床！",
    taskType: "daily",
    points: 1,
    habitTags: ["作息", "自律"],
    tips: "小闹钟一响，立刻坐起来，不赖床！",
    difficulty: "easy",
    ageRange: { min: 6, max: 7 },
    category: "life"
  },
  // 更多模板...
];

// 一年级默认奖励模板
const grade1RewardTemplates = [
  {
    name: "一本新绘本",
    description: "选一本你最喜欢的书！",
    rewardType: "physical",
    pointsRequired: 15,
    habitTags: ["学习", "阅读"],
    ageRange: { min: 6, max: 7 },
    category: "study_supplies",
    stock: 999
  },
  // 更多模板...
];

exports.main = async (event, context) => {
  const { action } = event;
  
  try {
    switch (action) {
      case 'initCollections':
        return await initCollections();
      case 'initDictionaries':
        return await initDictionaries();
      case 'initTemplates':
        return await initTemplates();
      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return { code: -1, message: '初始化失败', error: error.message };
  }
};

// 初始化集合
async function initCollections() {
  // 集合会在首次使用时自动创建，这里可以创建索引
  return { code: 0, message: '集合初始化完成' };
}

// 初始化字典数据
async function initDictionaries() {
  try {
    // 检查是否已存在字典数据
    const dictCount = await db.collection('dictionaries').count();
    
    if (dictCount.total > 0) {
      return { code: 0, message: '字典数据已存在' };
    }
    
    // 插入默认字典数据
    for (const category in defaultDictionaries) {
      const items = defaultDictionaries[category];
      for (const item of items) {
        await db.collection('dictionaries').add({
          data: {
            ...item,
            is_active: true,
            create_time: new Date(),
            update_time: new Date()
          }
        });
      }
    }
    
    return { code: 0, message: '字典数据初始化完成' };
  } catch (error) {
    throw error;
  }
}

// 初始化模板数据
async function initTemplates() {
  try {
    // 检查是否已存在模板数据
    const taskTemplateCount = await db.collection('task_templates').count();
    const rewardTemplateCount = await db.collection('reward_templates').count();
    
    if (taskTemplateCount.total > 0 || rewardTemplateCount.total > 0) {
      return { code: 0, message: '模板数据已存在' };
    }
    
    // 插入默认任务模板
    for (const template of grade1TaskTemplates) {
      await db.collection('task_templates').add({
        data: {
          ...template,
          templateId: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          isActive: true,
          sort_order: 0,
          usage_count: 0,
          version: 1,
          createBy: 'system',
          createTime: new Date(),
          updateTime: new Date()
        }
      });
    }
    
    // 插入默认奖励模板
    for (const template of grade1RewardTemplates) {
      await db.collection('reward_templates').add({
        data: {
          ...template,
          templateId: 'reward_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          isActive: true,
          sort_order: 0,
          usage_count: 0,
          version: 1,
          createBy: 'system',
          createTime: new Date(),
          updateTime: new Date()
        }
      });
    }
    
    return { code: 0, message: '模板数据初始化完成' };
  } catch (error) {
    throw error;
  }
}
```

## 10. 核心页面实现示例

### 10.1 首页 (index) 实现

#### 10.1.1 首页逻辑 (index.js)
```javascript
// pages/index/index.js
// 首页页面逻辑
const { businessDataManager } = require('../../utils/data-manager');

Page({
  data: {
    userInfo: null,
    currentChild: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function() {
    // 检查是否已登录
    const userInfo = businessDataManager.getUserInfo();
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
      
      // 获取当前儿童信息
      const currentChild = businessDataManager.getCurrentChild();
      if (currentChild) {
        this.setData({
          currentChild: currentChild
        });
      }
    }
  },

  onShow: function() {
    // 页面显示时更新数据
    this.refreshData();
  },

  // 刷新数据
  refreshData: function() {
    const userInfo = businessDataManager.getUserInfo();
    const currentChild = businessDataManager.getCurrentChild();
    
    this.setData({
      userInfo: userInfo,
      currentChild: currentChild,
      hasUserInfo: !!userInfo
    });
  },

  // 微信授权登录
  onGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      // 保存用户信息
      businessDataManager.setUserInfo(e.detail.userInfo);
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
      
      // 调用云函数创建用户记录
      wx.cloud.callFunction({
        name: 'getUserInfo',
        data: {
          action: 'create',
          data: e.detail.userInfo
        }
      }).then(res => {
        console.log('用户信息保存成功', res);
      }).catch(err => {
        console.error('用户信息保存失败', err);
      });
      
      // 跳转到家长页面
      wx.switchTab({
        url: '/pages/parent/parent'
      });
    }
  },

  // 跳转到家长页面
  goToParentPage: function() {
    wx.switchTab({
      url: '/pages/parent/parent'
    });
  },

  // 跳转到儿童页面
  goToChildPage: function() {
    if (this.data.currentChild) {
      wx.navigateTo({
        url: '/pages/child/child'
      });
    } else {
      wx.showToast({
        title: '请先添加儿童信息',
        icon: 'none'
      });
    }
  }
});
```

#### 10.1.2 首页结构 (index.wxml)
```xml
<!-- pages/index/index.wxml -->
<!-- 首页页面结构 -->
<view class="container">
  <view class="header">
    <image class="logo" src="/images/logo.png" mode="aspectFit"></image>
    <text class="title">StarBloom 儿童积分奖励系统</text>
  </view>

  <view class="content">
    <view wx:if="{{hasUserInfo}}" class="user-info">
      <image class="avatar" src="{{userInfo.avatarUrl}}" mode="aspectFit"></image>
      <text class="nickname">欢迎, {{userInfo.nickName}}!</text>
    </view>

    <view wx:if="{{hasUserInfo && currentChild}}" class="child-info">
      <view class="child-card">
        <image class="child-avatar" src="{{currentChild.avatar}}" mode="aspectFit"></image>
        <view class="child-details">
          <text class="child-name">{{currentChild.name}}</text>
          <text class="child-age">{{currentChild.age}}岁</text>
          <text class="child-points">积分: {{currentChild.totalPoints}}</text>
        </view>
      </view>
    </view>

    <view wx:if="{{!hasUserInfo}}" class="login-section">
      <text class="login-title">请先登录</text>
      <button 
        class="login-btn" 
        open-type="getUserInfo" 
        bindgetuserinfo="onGetUserInfo"
        style="background-color: #4CAF50; color: white;"
      >
        微信授权登录
      </button>
    </view>

    <view wx:if="{{hasUserInfo}}" class="navigation">
      <view class="nav-item" bindtap="goToParentPage">
        <image class="nav-icon" src="/images/parent-icon.png" mode="aspectFit"></image>
        <text class="nav-text">家长管理</text>
      </view>
      
      <view class="nav-item" bindtap="goToChildPage">
        <image class="nav-icon" src="/images/child-icon.png" mode="aspectFit"></image>
        <text class="nav-text">儿童视图</text>
      </view>
    </view>
  </view>

  <view class="footer">
    <text class="copyright">© 2023 StarBloom</text>
  </view>
</view>
```

#### 10.1.3 首页样式 (index.wxss)
```css
/* pages/index/index.wxss */
/* 首页页面样式 */
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.header {
  padding: 40rpx;
  text-align: center;
  background-color: #4CAF50;
  color: white;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
}

.content {
  flex: 1;
  padding: 40rpx;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
}

.child-info {
  margin-bottom: 40rpx;
}

.child-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: white;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.child-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 30rpx;
}

.child-details {
  flex: 1;
}

.child-name {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.child-age, .child-points {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.login-section {
  text-align: center;
  padding: 60rpx 0;
}

.login-title {
  font-size: 32rpx;
  margin-bottom: 40rpx;
  display: block;
}

.login-btn {
  width: 80%;
  padding: 20rpx;
  font-size: 32rpx;
  border-radius: 10rpx;
}

.navigation {
  display: flex;
  justify-content: space-around;
  margin-top: 60rpx;
}

.nav-item {
  text-align: center;
  width: 40%;
}

.nav-icon {
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 20rpx;
}

.nav-text {
  font-size: 28rpx;
  color: #333;
}

.footer {
  padding: 20rpx;
  text-align: center;
  background-color: #f0f0f0;
}

.copyright {
  font-size: 24rpx;
  color: #999;
}
```

### 10.2 家长管理页面实现

#### 10.2.1 家长页面逻辑 (parent.js)
```javascript
// pages/parent/parent.js
// 家长管理页面逻辑
const { businessDataManager } = require('../../utils/data-manager');

Page({
  data: {
    userInfo: null,
    currentChild: null,
    childrenList: [],
    activeTab: 'dashboard'
  },

  onLoad: function() {
    this.refreshData();
  },

  onShow: function() {
    this.refreshData();
  },

  // 刷新数据
  refreshData: function() {
    const userInfo = businessDataManager.getUserInfo();
    const currentChild = businessDataManager.getCurrentChild();
    const childrenList = businessDataManager.getChildrenList();
    
    this.setData({
      userInfo: userInfo,
      currentChild: currentChild,
      childrenList: childrenList || []
    });
    
    // 如果没有儿童信息，加载儿童列表
    if (!childrenList || childrenList.length === 0) {
      this.loadChildrenList();
    }
  },

  // 加载儿童列表
  loadChildrenList: function() {
    wx.cloud.callFunction({
      name: 'manageChildren',
      data: {
        action: 'list',
        data: {
          parentId: this.data.userInfo.openid
        }
      }
    }).then(res => {
      if (res.result.code === 0) {
        this.setData({
          childrenList: res.result.data
        });
        
        // 保存到数据管理器
        businessDataManager.setChildrenList(res.result.data);
        
        // 如果没有当前儿童，设置第一个为当前儿童
        if (!this.data.currentChild && res.result.data.length > 0) {
          this.setData({
            currentChild: res.result.data[0]
          });
          businessDataManager.setCurrentChild(res.result.data[0]);
        }
      }
    }).catch(err => {
      console.error('加载儿童列表失败', err);
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    });
  },

  // 切换标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  },

  // 添加儿童
  addChild: function() {
    wx.navigateTo({
      url: '/pages/parent/add-child/addchild'
    });
  },

  // 添加任务
  addTask: function() {
    if (!this.data.currentChild) {
      wx.showToast({
        title: '请先选择儿童',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/parent/add-task/add-task'
    });
  },

  // 添加奖励
  addReward: function() {
    wx.navigateTo({
      url: '/pages/parent/add-reward/add-reward'
    });
  },

  // 切换儿童
  switchChild: function(e) {
    const index = e.currentTarget.dataset.index;
    const child = this.data.childrenList[index];
    
    this.setData({
      currentChild: child
    });
    
    businessDataManager.setCurrentChild(child);
    
    wx.showToast({
      title: `已切换到${child.name}`,
      icon: 'success'
    });
  },

  // 查看任务
  viewTasks: function() {
    if (!this.data.currentChild) {
      wx.showToast({
        title: '请先选择儿童',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/tasks/tasks?childId=' + this.data.currentChild._id
    });
  },

  // 查看奖励
  viewRewards: function() {
    wx.navigateTo({
      url: '/pages/rewards/rewards'
    });
  },

  // 查看积分
  viewPoints: function() {
    if (!this.data.currentChild) {
      wx.showToast({
        title: '请先选择儿童',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/points/points?childId=' + this.data.currentChild._id
    });
  }
});
```

### 10.3 云函数实现示例

#### 10.3.1 用户信息管理云函数 (getUserInfo)
```javascript
// cloudfunctions/getUserInfo/index.js
// 用户信息管理云函数
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { action, data } = event;
  
  try {
    switch (action) {
      case 'get':
        return await getUserInfo(wxContext.OPENID);
      case 'create':
        return await createUserInfo(wxContext.OPENID, data);
      case 'update':
        return await updateUserInfo(wxContext.OPENID, data);
      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (error) {
    console.error('用户信息管理云函数执行失败:', error);
    return { code: -1, message: '操作失败', error: error.message };
  }
};

// 获取用户信息
async function getUserInfo(openid) {
  try {
    const result = await db.collection('users').where({
      openid: openid
    }).get();
    
    if (result.data && result.data.length > 0) {
      return { code: 0, message: 'success', data: result.data[0] };
    } else {
      return { code: 0, message: '用户不存在', data: null };
    }
  } catch (error) {
    throw error;
  }
}

// 创建用户信息
async function createUserInfo(openid, userData) {
  try {
    // 检查用户是否已存在
    const existingUser = await getUserInfo(openid);
    
    if (existingUser.data) {
      // 用户已存在，更新信息
      return await updateUserInfo(openid, userData);
    }
    
    // 创建新用户
    const result = await db.collection('users').add({
      data: {
        openid: openid,
        nickName: userData.nickName || '',
        avatarUrl: userData.avatarUrl || '',
        isAdmin: false,
        isAdvancedUser: false,
        createTime: new Date(),
        updateTime: new Date()
      }
    });
    
    return { code: 0, message: '用户创建成功', data: { _id: result._id } };
  } catch (error) {
    throw error;
  }
}

// 更新用户信息
async function updateUserInfo(openid, userData) {
  try {
    const result = await db.collection('users').where({
      openid: openid
    }).update({
      data: {
        nickName: userData.nickName || '',
        avatarUrl: userData.avatarUrl || '',
        updateTime: new Date(),
        ...userData
      }
    });
    
    return { code: 0, message: '用户信息更新成功', data: result };
  } catch (error) {
    throw error;
  }
}
```

#### 10.3.2 儿童信息管理云函数 (manageChildren)
```javascript
// cloudfunctions/manageChildren/index.js
// 儿童信息管理云函数
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { action, data } = event;
  
  try {
    switch (action) {
      case 'list':
        return await listChildren(data.parentId || wxContext.OPENID);
      case 'create':
        return await createChild(data, wxContext.OPENID);
      case 'update':
        return await updateChild(data, wxContext.OPENID);
      case 'delete':
        return await deleteChild(data.childId, wxContext.OPENID);
      case 'getStats':
        return await getChildStats(data.childId);
      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (error) {
    console.error('儿童信息管理云函数执行失败:', error);
    return { code: -1, message: '操作失败', error: error.message };
  }
};

// 获取儿童列表
async function listChildren(parentId) {
  try {
    const result = await db.collection('children').where({
      parentId: parentId
    }).orderBy('createTime', 'asc').get();
    
    return { code: 0, message: 'success', data: result.data };
  } catch (error) {
    throw error;
  }
}

// 创建儿童信息
async function createChild(childData, parentId) {
  try {
    const result = await db.collection('children').add({
      data: {
        name: childData.name,
        age: childData.age,
        avatar: childData.avatar || '',
        parentId: parentId,
        totalPoints: 0,
        totalEarnedPoints: 0,
        totalConsumedPoints: 0,
        createTime: new Date(),
        updateTime: new Date()
      }
    });
    
    return { code: 0, message: '儿童信息创建成功', data: { _id: result._id } };
  } catch (error) {
    throw error;
  }
}

// 更新儿童信息
async function updateChild(childData, parentId) {
  try {
    // 验证权限
    const child = await db.collection('children').doc(childData._id).get();
    if (!child.data || child.data.parentId !== parentId) {
      throw new Error('权限不足');
    }
    
    const result = await db.collection('children').doc(childData._id).update({
      data: {
        name: childData.name,
        age: childData.age,
        avatar: childData.avatar || '',
        updateTime: new Date(),
        ...childData
      }
    });
    
    return { code: 0, message: '儿童信息更新成功', data: result };
  } catch (error) {
    throw error;
  }
}

// 删除儿童信息
async function deleteChild(childId, parentId) {
  try {
    // 验证权限
    const child = await db.collection('children').doc(childId).get();
    if (!child.data || child.data.parentId !== parentId) {
      throw new Error('权限不足');
    }
    
    const result = await db.collection('children').doc(childId).remove();
    
    return { code: 0, message: '儿童信息删除成功', data: result };
  } catch (error) {
    throw error;
  }
}

// 获取儿童统计数据
async function getChildStats(childId) {
  try {
    // 获取任务完成统计
    const taskStats = await db.collection('task_completion_records')
      .where({ childId: childId })
      .count();
    
    // 获取积分记录统计
    const pointStats = await db.collection('point_records')
      .where({ childId: childId })
      .count();
    
    // 获取兑换记录统计
    const exchangeStats = await db.collection('exchange_records')
      .where({ childId: childId })
      .count();
    
    return { 
      code: 0, 
      message: 'success', 
      data: {
        taskCount: taskStats.total,
        pointRecordCount: pointStats.total,
        exchangeCount: exchangeStats.total
      }
    };
  } catch (error) {
    throw error;
  }
}
```

## 11. 工具类实现

### 11.1 API客户端 (api-client.js)
```javascript
// utils/api-client.js
// API客户端

// 调用云函数的通用方法
function callFunction(name, data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: name,
      data: data,
      success: res => {
        resolve(res.result);
      },
      fail: err => {
        console.error(`${name}调用失败:`, err);
        reject(err);
      }
    });
  });
}

// 上传文件
function uploadFile(filePath, cloudPath) {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: res => {
        resolve(res);
      },
      fail: err => {
        console.error('文件上传失败:', err);
        reject(err);
      }
    });
  });
}

// 下载文件
function downloadFile(fileID) {
  return new Promise((resolve, reject) => {
    wx.cloud.downloadFile({
      fileID: fileID,
      success: res => {
        resolve(res);
      },
      fail: err => {
        console.error('文件下载失败:', err);
        reject(err);
      }
    });
  });
}

module.exports = {
  callFunction,
  uploadFile,
  downloadFile
};
```

### 11.2 API服务层 (api-services.js)
```javascript
// utils/api-services.js
// API服务层
const { callFunction } = require('./api-client');

const apiServices = {
  // 用户管理API
  userApi: {
    getCurrentUser: () => callFunction('getUserInfo', { action: 'get' }),
    updateProfile: (data) => callFunction('getUserInfo', { action: 'update', data: data }),
    loginOrRegister: (data) => callFunction('getUserInfo', { action: 'create', data: data })
  },

  // 儿童管理API
  childrenApi: {
    getList: (parentId) => callFunction('manageChildren', { action: 'list', data: { parentId } }),
    create: (data) => callFunction('manageChildren', { action: 'create', data: data }),
    update: (data) => callFunction('manageChildren', { action: 'update', data: data }),
    delete: (childId) => callFunction('manageChildren', { action: 'delete', data: { childId } }),
    getStats: (childId) => callFunction('manageChildren', { action: 'getStats', data: { childId } })
  },

  // 任务管理API
  tasksApi: {
    getList: (parentId) => callFunction('manageTasks', { action: 'list', data: { parentId } }),
    create: (data) => callFunction('manageTasks', { action: 'create', data: data }),
    update: (data) => callFunction('manageTasks', { action: 'update', data: data }),
    delete: (taskId) => callFunction('manageTasks', { action: 'delete', data: { taskId } }),
    complete: (data) => callFunction('manageTasks', { action: 'complete', data: data })
  },

  // 奖励管理API
  rewardsApi: {
    getList: (parentId) => callFunction('manageRewards', { action: 'list', data: { parentId } }),
    create: (data) => callFunction('manageRewards', { action: 'create', data: data }),
    update: (data) => callFunction('manageRewards', { action: 'update', data: data }),
    delete: (rewardId) => callFunction('manageRewards', { action: 'delete', data: { rewardId } })
  },

  // 积分管理API
  pointsApi: {
    getHistory: (childId) => callFunction('managePoints', { action: 'history', data: { childId } }),
    getBalance: (childId) => callFunction('managePoints', { action: 'balance', data: { childId } }),
    getStatistics: (childId) => callFunction('managePoints', { action: 'statistics', data: { childId } })
  },

  // 兑换管理API
  exchangeApi: {
    createExchange: (data) => callFunction('managePoints', { action: 'exchange', data: data }),
    getHistory: (childId) => callFunction('managePoints', { action: 'exchangeHistory', data: { childId } }),
    approve: (exchangeId) => callFunction('managePoints', { action: 'approveExchange', data: { exchangeId } }),
    reject: (exchangeId) => callFunction('managePoints', { action: 'rejectExchange', data: { exchangeId } })
  },

  // 字典管理API
  dictionaryApi: {
    getByCategory: (category) => callFunction('manageDictionary', { action: 'getByCategory', data: { category } }),
    getAll: () => callFunction('manageDictionary', { action: 'getAll' }),
    add: (data) => callFunction('manageDictionary', { action: 'add', data: data }),
    update: (data) => callFunction('manageDictionary', { action: 'update', data: data }),
    delete: (id) => callFunction('manageDictionary', { action: 'delete', data: { id } }),
    refresh: () => callFunction('manageDictionary', { action: 'refresh' })
  },

  // 预设模板管理API
  templatesApi: {
    getTaskTemplates: (ageGroup) => callFunction('manageTemplates', { action: 'getTaskTemplates', data: { ageGroup } }),
    getRewardTemplates: (ageGroup) => callFunction('manageTemplates', { action: 'getRewardTemplates', data: { ageGroup } }),
    applyTemplate: (data) => callFunction('manageTemplates', { action: 'applyTemplate', data: data }),
    getByAgeGroup: (ageGroup) => callFunction('manageTemplates', { action: 'getByAgeGroup', data: { ageGroup } })
  },

  // 模板管理API
  templateManagementApi: {
    getTaskTemplateList: (params) => callFunction('manageTemplateData', { action: 'getTaskTemplateList', data: params }),
    getRewardTemplateList: (params) => callFunction('manageTemplateData', { action: 'getRewardTemplateList', data: params }),
    createTaskTemplate: (data) => callFunction('manageTemplateData', { action: 'createTaskTemplate', data: data }),
    updateTaskTemplate: (data) => callFunction('manageTemplateData', { action: 'updateTaskTemplate', data: data }),
    deleteTaskTemplate: (templateId) => callFunction('manageTemplateData', { action: 'deleteTaskTemplate', data: { templateId } }),
    createRewardTemplate: (data) => callFunction('manageTemplateData', { action: 'createRewardTemplate', data: data }),
    updateRewardTemplate: (data) => callFunction('manageTemplateData', { action: 'updateRewardTemplate', data: data }),
    deleteRewardTemplate: (templateId) => callFunction('manageTemplateData', { action: 'deleteRewardTemplate', data: { templateId } }),
    importTemplates: (data) => callFunction('importExportTemplates', { action: 'import', data: data }),
    exportTemplates: (params) => callFunction('importExportTemplates', { action: 'export', data: params }),
    getTemplateStats: () => callFunction('manageTemplateData', { action: 'getTemplateStats' }),
    toggleTemplateStatus: (templateId, status) => callFunction('manageTemplateData', { action: 'toggleStatus', data: { templateId, status } }),
    getTemplateImportExportRecords: () => callFunction('importExportTemplates', { action: 'getRecords' })
  }
};

module.exports = apiServices;
```

### 11.3 数据管理器 (data-manager.js)
```javascript
// utils/data-manager.js
// 数据管理器
// 遵循用户偏好的统一数据管理模块偏好
const businessDataManager = {
  // 用户信息管理
  setUserInfo(userInfo) {
    wx.setStorageSync('userInfo', userInfo);
  },

  getUserInfo() {
    return wx.getStorageSync('userInfo');
  },

  // 儿童信息管理
  setCurrentChild(child) {
    wx.setStorageSync('currentChild', child);
  },

  getCurrentChild() {
    return wx.getStorageSync('currentChild');
  },

  setChildrenList(children) {
    wx.setStorageSync('childrenList', children);
  },

  getChildrenList() {
    return wx.getStorageSync('childrenList');
  },

  // 设置信息管理
  setSettings(settings) {
    const currentSettings = wx.getStorageSync('appSettings') || {};
    wx.setStorageSync('appSettings', { ...currentSettings, ...settings });
  },

  getSettings() {
    return wx.getStorageSync('appSettings') || {};
  },

  // 从全局数据同步
  syncFromGlobalData() {
    // 实现从全局数据同步的逻辑
  },

  // 清理所有数据
  clearAll() {
    wx.clearStorageSync();
  }
};

module.exports = {
  businessDataManager
};
```

### 11.4 工具函数 (util.js)
```javascript
// utils/util.js
// 工具函数

// 格式化日期
function formatDate(date, fmt = 'yyyy-MM-dd') {
  if (!date) return '';
  
  const d = new Date(date);
  const o = {
    "M+": d.getMonth() + 1,
    "d+": d.getDate(),
    "h+": d.getHours(),
    "m+": d.getMinutes(),
    "s+": d.getSeconds(),
    "q+": Math.floor((d.getMonth() + 3) / 3),
    "S": d.getMilliseconds()
  };
  
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  
  for (let k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  
  return fmt;
}

// 计算年龄
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 节流函数
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 深拷贝
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

module.exports = {
  formatDate,
  calculateAge,
  debounce,
  throttle,
  deepClone
};
```

## 10. 设计规范

### 10.1 界面设计规范
- **主题色**: 绿色系 (#4CAF50)
- **辅助色**: 淡绿色 (#81C784), 深绿色 (#388E3C)
- **强调色**: 橙色 (#FF9800), 红色 (#F44336)
- **关闭按钮**: 位于右上角，采用简洁的纯文本样式，避免椭圆形背景
- **操作按钮**: 统一放置在界面右上角

### 10.2 代码规范
- 使用现代 JavaScript 语法 (ES6+)
- 统一的代码风格和命名规范
- 完整的代码注释
- 遵循微信小程序开发规范

### 10.3 数据管理规范
- 统一使用 data-manager.js 进行数据管理
- 遵循用户偏好的统一数据管理模块偏好
- 实现数据缓存和同步机制