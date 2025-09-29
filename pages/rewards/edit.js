// pages/rewards/edit.js
// 编辑奖励页面逻辑
const { rewardsApi } = require('../../utils/api-services.js');
import { 
  getCategoryOptions, 
  getRewardTypeOptions, 
  getStatusOptions,
  getHabitTagOptions,
  getAgeGroupOptions,
  getCategoryInfo,
  getRewardTypeInfo 
} from '../../utils/reward-categories-config.js';
const dictionaryManager = require('../../utils/dictionary-manager.js');

Page({
  data: {
    loading: false,
    rewardId: '',
    
    // 奖励表单数据
    formData: {
    },
    
    // 选项数据
    options: {
      categories: [],
      rewardTypes: [],
      statuses: [],
      ageGroups: [],
      habitTagGroups: []
    },
    
    // 孩子列表和选择状态
    childrenList: [],
    habitTagsDisplay: [],
    
    // 表单验证
    errors: {}
  },

  onLoad: async function(options) {
    console.log('编辑奖励页面加载，参数:', options);
    
    // 初始化选项数据
    this.setData({
      'options.categories': getCategoryOptions(),
      'options.rewardTypes': getRewardTypeOptions(),
      'options.statuses': getStatusOptions(),
      'options.ageGroups': getAgeGroupOptions(),
      'options.habitTagGroups': getHabitTagOptions()
    });
    
    // 加载孩子列表
    await this.loadChildren();
    
    if (options.rewardId) {
      this.setData({ rewardId: options.rewardId });
    }
    
    // 检查是否有传递的数据
    const app = getApp();
    const fromData = options.fromData === 'true';
    
    if (fromData && app.globalData && app.globalData.editRewardData) {
      // 使用传递的数据，避免API调用
      console.log('使用传递的奖励数据:', app.globalData.editRewardData);
      this.setRewardData(app.globalData.editRewardData);
      
      // 清除全局数据
      delete app.globalData.editRewardData;
    } else if (options.rewardId) {
      // 回退到API调用方式
      console.log('使用API加载奖励数据');
      //this.loadRewardData(options.rewardId);
    } else {
      console.error('缺少奖励ID参数');
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 加载孩子列表
  loadChildren: async function() {
    try {
      const app = getApp();
      if (app.globalData.childrenList && app.globalData.childrenList.length > 0) {
        this.setData({
          childrenList: app.globalData.childrenList
        });
      } else {
        // 如果全局数据中没有，则调用API获取
        const { childrenApi } = require('../../utils/api-services.js');
        const result = await childrenApi.getList();
        if (result.code === 0) {
          this.setData({
            childrenList: result.data || []
          });
        }
      }
    } catch (error) {
      console.error('加载孩子列表失败:', error);
    }
  },

  // 设置奖励数据的通用方法
  setRewardData: function(rewardData) {
    console.log('设置奖励数据:', rewardData);
    
    // 确保必要字段存在
    const formData = {
      ...rewardData,
      habitTags: rewardData.habitTags || [],
      selectedChildIds: rewardData.childIds || [],
      exchangeRules: rewardData.exchangeRules || '',
      recommendedStock: rewardData.recommendedStock || rewardData.stock || 100,
      ageGroup: rewardData.ageGroup || 'primary'
    };
    
    this.setData({
      formData: formData
    });
    
    // 更新习惯标签显示状态
    this.updateHabitTagsDisplay();
  },

  // 更新习惯标签显示状态
  updateHabitTagsDisplay: function() {
    const habitTagGroups = this.data.options.habitTagGroups;
    const selectedTags = this.data.formData.habitTags || [];
    
    const habitTagsDisplay = habitTagGroups.map(group => ({
      ...group,
      tags: group.tags.map(tag => ({
        ...tag,
        selected: selectedTags.includes(tag.value)
      }))
    }));
    
    this.setData({
      habitTagsDisplay: habitTagsDisplay
    });
  },

  // 孩子选择处理
  onChildToggle: function(e) {
    const { childId } = e.currentTarget.dataset;
    const selectedChildIds = [...(this.data.formData.selectedChildIds || [])];
    
    const index = selectedChildIds.indexOf(childId);
    if (index > -1) {
      selectedChildIds.splice(index, 1);
    } else {
      selectedChildIds.push(childId);
    }
    
    this.setData({
      'formData.selectedChildIds': selectedChildIds
    });
  },

  // 习惯标签选择处理
  onHabitTagToggle: function(e) {
    const { tag } = e.currentTarget.dataset;
    const habitTags = [...(this.data.formData.habitTags || [])];
    
    const index = habitTags.indexOf(tag);
    if (index > -1) {
      habitTags.splice(index, 1);
    } else {
      habitTags.push(tag);
    }
    
    this.setData({
      'formData.habitTags': habitTags
    });
    
    // 更新显示状态
    this.updateHabitTagsDisplay();
  },

  // 表单输入处理
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value,
      [`errors.${field}`]: '' // 清除错误信息
    });
  },

  // 选择器变化处理
  onPickerChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    const options = this.data.options.rewardTypes;  
    //console.log('选择器变化1，选项:', options[value]);
    if (options && options[value]) {
      const selectedOption = options[value];
      this.setData({
        'formData.rewardType': selectedOption.value
      });
     // console.log('选择器变化，选项:', this.data.formData.rewardType);
    }
  },

  // 积分调整
  onPointsChange: function(e) {
    const { type } = e.currentTarget.dataset;
    let points = this.data.formData.pointsRequired;
    
    if (type === 'increase') {
      points = Math.min(points + 10, 500);
    } else {
      points = Math.max(points - 10, 10);
    }
    
    this.setData({
      'formData.pointsRequired': points
    });
  },

  // 表单验证
  validateForm: function() {
    const { formData } = this.data;
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = '请输入奖励名称';
    }
    
    if (formData.name.length > 20) {
      errors.name = '奖励名称不能超过20个字符';
    }
    
    if (formData.description && formData.description.length > 100) {
      errors.description = '奖励描述不能超过100个字符';
    }
    
    if (formData.pointsRequired < 10 || formData.pointsRequired > 500) {
      errors.pointsRequired = '所需积分必须在10-500之间';
    }
    
    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  // 保存奖励
  onSave: async function() {
    if (!this.validateForm()) {
      wx.showToast({ title: '请检查表单信息', icon: 'none' });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const rewardData = {
        ...this.data.formData,
        updatedAt: new Date().toISOString()
      };
      
      wx.showLoading({ title: '保存中...' });
      
      const result = await rewardsApi.update(this.data.rewardId, rewardData);
      
      if (result.code === 0) {
        wx.showToast({ 
          title: '奖励更新成功！', 
          icon: 'success' 
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.msg || '更新奖励失败');
      }
      
    } catch (error) {
      console.error('保存奖励失败:', error);
      wx.showToast({ 
        title: error.message || '保存失败，请重试', 
        icon: 'none' 
      });
    } finally {
      wx.hideLoading();
      this.setData({ loading: false });
    }
  },

  // 返回
  onBack: function() {
    wx.navigateBack();
  }
});