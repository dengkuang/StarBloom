#!/bin/bash
# scripts/deploy-functions.sh
# 云函数部署脚本

echo "开始部署云函数..."

# 部署所有云函数
cloudbase fn deploy getUserInfo
cloudbase fn deploy manageChildren
cloudbase fn deploy manageTasks
cloudbase fn deploy manageRewards
cloudbase fn deploy managePoints
cloudbase fn deploy dataAnalysis
cloudbase fn deploy manageDictionary
cloudbase fn deploy manageTemplates
cloudbase fn deploy manageTemplateData
cloudbase fn deploy importExportTemplates
cloudbase fn deploy initDatabase
cloudbase fn deploy initDefaultRewards

echo "云函数部署完成"