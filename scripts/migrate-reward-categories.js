// 奖励分类数据迁移脚本
// 用于将现有奖励数据迁移到统一的分类和类型系统

const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 分类映射表 - 将旧的分类映射到新的统一分类
const CATEGORY_MAPPING = {
  // 现有的分类保持不变
  'toy': 'toy',
  'food': 'food', 
  'activity': 'activity',
  'privilege': 'privilege',
  'outing': 'outing',
  'digital': 'digital',
  'book': 'book',
  'clothing': 'clothing',
  'experience': 'experience',
  'other': 'other',
  
  // 新增的分类
  'study_supplies': 'study_supplies',
  
  // 可能的旧分类映射
  'stationery': 'study_supplies',
  'learning': 'study_supplies',
  'entertainment': 'activity',
  'outdoor': 'outing',
  'electronics': 'digital'
};

// 奖励类型映射表
const REWARD_TYPE_MAPPING = {
  'physical': 'physical',
  'privilege': 'privilege', 
  'experience': 'experience',
  'virtual': 'virtual',
  'charity': 'charity',
  
  // 可能的旧类型映射
  'material': 'physical',
  'right': 'privilege',
  'activity': 'experience'
};

// 状态映射表
const STATUS_MAPPING = {
  'active': 'active',
  'inactive': 'inactive',
  'out_of_stock': 'out_of_stock',
  
  // 可能的旧状态映射
  'enabled': 'active',
  'disabled': 'inactive',
  'unavailable': 'out_of_stock',
  'sold_out': 'out_of_stock'
};

async function migrateRewardCategories() {
  console.log('开始迁移奖励分类数据...');
  
  try {
    // 获取所有奖励记录
    const rewardsResult = await db.collection('rewards').get();
    const rewards = rewardsResult.data;
    
    console.log(`找到 ${rewards.length} 条奖励记录`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const reward of rewards) {
      try {
        const updateData = {};
        let needUpdate = false;
        
        // 迁移分类
        if (reward.category) {
          const newCategory = CATEGORY_MAPPING[reward.category] || 'other';
          if (newCategory !== reward.category) {
            updateData.category = newCategory;
            needUpdate = true;
            console.log(`奖励 ${reward.name}: 分类 ${reward.category} -> ${newCategory}`);
          }
        } else {
          // 如果没有分类，根据奖励类型推断
          const inferredCategory = inferCategoryFromRewardType(reward.rewardType) || 'other';
          updateData.category = inferredCategory;
          needUpdate = true;
          console.log(`奖励 ${reward.name}: 添加分类 ${inferredCategory}`);
        }
        
        // 迁移奖励类型
        if (reward.rewardType) {
          const newRewardType = REWARD_TYPE_MAPPING[reward.rewardType] || 'physical';
          if (newRewardType !== reward.rewardType) {
            updateData.rewardType = newRewardType;
            needUpdate = true;
            console.log(`奖励 ${reward.name}: 类型 ${reward.rewardType} -> ${newRewardType}`);
          }
        } else {
          // 如果没有奖励类型，设置默认值
          updateData.rewardType = 'physical';
          needUpdate = true;
          console.log(`奖励 ${reward.name}: 添加类型 physical`);
        }
        
        // 迁移状态
        if (reward.status) {
          const newStatus = STATUS_MAPPING[reward.status] || 'active';
          if (newStatus !== reward.status) {
            updateData.status = newStatus;
            needUpdate = true;
            console.log(`奖励 ${reward.name}: 状态 ${reward.status} -> ${newStatus}`);
          }
        } else {
          // 如果没有状态，根据isActive字段推断
          const inferredStatus = reward.isActive === false ? 'inactive' : 'active';
          updateData.status = inferredStatus;
          needUpdate = true;
          console.log(`奖励 ${reward.name}: 添加状态 ${inferredStatus}`);
        }
        
        // 确保必要字段存在
        if (!reward.stock && reward.stock !== 0) {
          updateData.stock = reward.recommendedStock || 100;
          needUpdate = true;
        }
        
        if (!reward.childIds) {
          updateData.childIds = [];
          needUpdate = true;
        }
        
        // 添加更新时间
        if (needUpdate) {
          updateData.updateTime = new Date();
          updateData.migratedAt = new Date();
          
          await db.collection('rewards').doc(reward._id).update({
            data: updateData
          });
          
          updatedCount++;
          console.log(`✓ 奖励 ${reward.name} 更新成功`);
        }
        
      } catch (error) {
        console.error(`✗ 更新奖励 ${reward.name} 失败:`, error);
        errorCount++;
      }
    }
    
    console.log('\n=== 迁移完成 ===');
    console.log(`总记录数: ${rewards.length}`);
    console.log(`更新成功: ${updatedCount}`);
    console.log(`更新失败: ${errorCount}`);
    console.log(`无需更新: ${rewards.length - updatedCount - errorCount}`);
    
    return {
      success: true,
      total: rewards.length,
      updated: updatedCount,
      errors: errorCount
    };
    
  } catch (error) {
    console.error('迁移过程中发生错误:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 根据奖励类型推断分类
function inferCategoryFromRewardType(rewardType) {
  const typeToCategory = {
    'physical': 'toy',
    'privilege': 'privilege',
    'experience': 'experience',
    'virtual': 'digital',
    'charity': 'other'
  };
  
  return typeToCategory[rewardType];
}

// 验证迁移结果
async function validateMigration() {
  console.log('\n开始验证迁移结果...');
  
  try {
    const rewardsResult = await db.collection('rewards').get();
    const rewards = rewardsResult.data;
    
    const validCategories = Object.values(CATEGORY_MAPPING);
    const validRewardTypes = Object.values(REWARD_TYPE_MAPPING);
    const validStatuses = Object.values(STATUS_MAPPING);
    
    let invalidCount = 0;
    
    for (const reward of rewards) {
      const issues = [];
      
      if (!reward.category || !validCategories.includes(reward.category)) {
        issues.push(`无效分类: ${reward.category}`);
      }
      
      if (!reward.rewardType || !validRewardTypes.includes(reward.rewardType)) {
        issues.push(`无效类型: ${reward.rewardType}`);
      }
      
      if (!reward.status || !validStatuses.includes(reward.status)) {
        issues.push(`无效状态: ${reward.status}`);
      }
      
      if (issues.length > 0) {
        console.log(`✗ 奖励 ${reward.name}: ${issues.join(', ')}`);
        invalidCount++;
      }
    }
    
    if (invalidCount === 0) {
      console.log('✓ 所有奖励数据验证通过');
    } else {
      console.log(`✗ 发现 ${invalidCount} 条无效记录`);
    }
    
    return invalidCount === 0;
    
  } catch (error) {
    console.error('验证过程中发生错误:', error);
    return false;
  }
}

// 主函数
async function main() {
  console.log('=== 奖励分类数据迁移工具 ===\n');
  
  // 执行迁移
  const migrationResult = await migrateRewardCategories();
  
  if (migrationResult.success) {
    // 验证迁移结果
    const validationResult = await validateMigration();
    
    if (validationResult) {
      console.log('\n🎉 迁移和验证全部完成！');
    } else {
      console.log('\n⚠️ 迁移完成但验证发现问题，请检查日志');
    }
  } else {
    console.log('\n❌ 迁移失败:', migrationResult.error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  migrateRewardCategories,
  validateMigration,
  CATEGORY_MAPPING,
  REWARD_TYPE_MAPPING,
  STATUS_MAPPING
};