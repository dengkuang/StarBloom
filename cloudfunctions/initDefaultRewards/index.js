// 默认奖励初始化云函数
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = require('lodash');

// 默认奖励模板数据（适配新的数据结构）
const defaultRewards = [
  {
    name: '小贴纸',
    description: '可爱的卡通贴纸',
    pointsRequired: 10,
    rewardType: 'physical',
    stock: 100,
    status: 'active',
    imageUrl: '/images/rewards/sticker.png'
  },
  {
    name: '额外游戏时间',
    description: '延长30分钟游戏时间',
    pointsRequired: 20,
    rewardType: 'privilege',
    stock: 999,
    status: 'active',
    imageUrl: '/images/rewards/game-time.png'
  },
  {
    name: '选择晚餐',
    description: '选择一次晚餐菜品',
    pointsRequired: 30,
    rewardType: 'privilege',
    stock: 999,
    status: 'active',
    imageUrl: '/images/rewards/dinner.png'
  },
  {
    name: '去公园',
    description: '周末去公园游玩',
    pointsRequired: 50,
    rewardType: 'experience',
    stock: 50,
    status: 'active',
    imageUrl: '/images/rewards/park.png'
  }
];

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { action, data } = event;
  
  try {
    switch (action) {
      case 'init':
        return await initializeDefaultRewards(wxContext.OPENID);
      case 'reset':
        return await resetDefaultRewards(wxContext.OPENID);
      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (error) {
    console.error('initDefaultRewards error:', error);
    return { code: -1, message: '系统错误，请稍后重试' };
  }
};

async function initializeDefaultRewards(parentId) {
  try {
    // 首先确保rewards集合存在
    await createRewardsCollectionIfNotExist();
    
    const rewardsCollection = db.collection('rewards');
    
    // 检查是否已存在默认奖励
    const existingRewardNames = defaultRewards.map(r => r.name);
    const existingResult = await rewardsCollection.where({
      parentId: parentId,
      name: db.command.in(existingRewardNames)
    }).get();
    
    if (existingResult.data.length === 0) {
      // 添加默认奖励
      const addedRewards = [];
      for (const reward of defaultRewards) {
        const rewardData = {
          ...reward,
          parentId: parentId,
          createTime: new Date(),
          updateTime: new Date()
        };
        
        const result = await rewardsCollection.add({
          data: rewardData
        });
        
        rewardData._id = result._id;
        addedRewards.push(rewardData);
      }
      
      return { code: 0, message: '默认奖励初始化成功', data: addedRewards };
    } else {
      return { code: 0, message: '默认奖励已存在，无需初始化', data: existingResult.data };
    }
  } catch (error) {
    console.error('initializeDefaultRewards error:', error);
    return { code: -1, message: '默认奖励初始化失败', error: error.message };
  }
}

// 创建rewards集合（如果不存在）
async function createRewardsCollectionIfNotExist() {
  try {
    // 尝试获取集合信息，如果不存在会抛出错误
    await db.collection('rewards').get();
    console.log('集合 rewards 已存在');
  } catch (error) {
    if (error.errCode === 'DATABASE_COLLECTION_NOT_EXIST') {
      console.log('集合 rewards 不存在，将自动创建');
      // 通过添加一条记录来隐式创建集合
      await db.collection('rewards').add({
        data: {
          _createTime: new Date(),
          _updateTime: new Date(),
          isTemp: true
        }
      });
      // 删除临时记录
      const result = await db.collection('rewards').where({
        isTemp: true
      }).get();
      
      if (result.data.length > 0) {
        await db.collection('rewards').doc(result.data[0]._id).remove();
      }
      console.log('集合 rewards 创建成功');
    } else {
      throw error;
    }
  }
}

async function resetDefaultRewards(parentId) {
  try {
    const rewardsCollection = db.collection('rewards');
    
    // 删除现有的默认奖励
    const existingRewardNames = defaultRewards.map(r => r.name);
    const existingResult = await rewardsCollection.where({
      parentId: parentId,
      name: db.command.in(existingRewardNames)
    }).get();
    
    for (const reward of existingResult.data) {
      await rewardsCollection.doc(reward._id).remove();
    }
    
    // 重新添加默认奖励
    const addedRewards = [];
    for (const reward of defaultRewards) {
      const rewardData = {
        ...reward,
        parentId: parentId,
        createTime: new Date(),
        updateTime: new Date()
      };
      
      const result = await rewardsCollection.add({
        data: rewardData
      });
      
      rewardData._id = result._id;
      addedRewards.push(rewardData);
    }
    
    return { code: 0, message: '默认奖励重置成功', data: addedRewards };
  } catch (error) {
    console.error('resetDefaultRewards error:', error);
    return { code: -1, message: '默认奖励重置失败', error: error.message };
  }
}