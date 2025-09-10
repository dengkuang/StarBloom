# StarBloom 儿童积分奖励系统

## 项目概述

StarBloom是一个基于微信小程序的儿童积分奖励系统，旨在帮助家长通过游戏化的方式激励和管理孩子的行为。

## 技术架构

- **前端框架**: 微信小程序原生框架 (WXML/WXSS/JavaScript)
- **后端架构**: 微信云开发 Serverless 架构
- **数据库**: 微信云数据库 (NoSQL)
- **文件存储**: 微信云存储
- **主题色**: 绿色系 (#4CAF50)

## 项目结构

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
│   ├── cloud-init.js               # 云环境初始化工具
│   └── util.js                     # 工具函数
├── cloud/                          # 云环境配置
│   └── config.js                   # 云环境配置文件
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

## 核心功能

1. **儿童管理**: 添加、编辑、删除儿童信息
2. **任务系统**: 创建、分配、完成任务
3. **奖励系统**: 设置、兑换奖励
4. **积分管理**: 积分的增减、统计
5. **数据分析**: 任务完成情况、积分变化等数据分析
6. **模板系统**: 预设任务和奖励模板，方便快速创建
7. **系统设置**: 用户偏好设置、字典配置等

## 开发规范

- 遵循用户偏好的界面颜色偏好：使用绿色作为界面主题色
- 统一使用data-manager.js进行数据管理
- 组件化开发，提高代码复用性
- 云函数按功能模块划分，职责单一

## 云环境配置

1. 在[微信公众平台](https://mp.weixin.qq.com/)注册小程序并获取AppID
2. 在微信开发者工具中创建云开发环境
3. 修改`cloud/config.js`文件中的环境ID：
   ```javascript
   const config = {
     // 开发环境ID，请根据实际情况修改
     env: 'your-env-id',  // 替换为你的实际环境ID
   
     // 云函数列表
     functions: [
       // ... 云函数列表
     ]
   };
   ```
4. 确保在`app.js`中正确初始化了云环境

## 部署说明

1. 确保已安装微信开发者工具
2. 在微信云开发控制台创建云环境
3. 部署云函数到云环境：
   ```bash
   # 在项目根目录执行
   cd cloudfunctions
   # 逐个部署云函数或使用脚本批量部署
   ```
4. 在微信开发者工具中导入项目并运行
5. 在云开发控制台初始化数据库集合和索引