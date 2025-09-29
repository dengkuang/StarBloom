// pages/rewards/add.js
// 添加奖励页面逻辑
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

Page({
  onLoad: async function() {
    // 初始化选项数据
    this.setData({
      'options.categories': getCategoryOptions(),
      'options.rewardTypes': getRewardTypeOptions(),
      'options.statuses': getStatusOptions(),
      'options.ageGroups': getAgeGroupOptions(),
      'options.habitTagGroups': getHabitTagOptions()
    });
    
    // 初始化习惯标签显示状态
    this.updateHabitTagsDisplay();
    
    // 加载孩子列表
    await this.loadChildren();
  },

  data: {
    loading: false,
    
    // 奖励表单数据
    formData: {
      name: '',
      description: '',
      pointsRequired: 50,
      category: 'toy',
      rewardType: 'physical',
      status: 'active',
      stock: 100,
      recommendedStock: 100,
      ageGroup: 'primary',
      habitTags: [],
      exchangeRules: '',
      selectedChildIds: [],
      emoji: '🎁',
      icon: ''
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
    const options = this.data.options[field + 's'] || this.data.options[field];
    
    if (options && options[value]) {
      const selectedOption = options[value];
      this.setData({
        [`formData.${field}`]: selectedOption.value,
        'formData.emoji': selectedOption.emoji
      });
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
    
    if (formData.description && formData.description.length > 200) {
      errors.description = '奖励描述不能超过200个字符';
    }
    
    if (formData.pointsRequired < 1 || formData.pointsRequired > 1000) {
      errors.pointsRequired = '所需积分必须在1-1000之间';
    }
    
    if (formData.stock < 0) {
      errors.stock = '库存数量不能为负数';
    }
    
    if (formData.recommendedStock < 0) {
      errors.recommendedStock = '推荐库存不能为负数';
    }
    
    if (formData.exchangeRules && formData.exchangeRules.length > 200) {
      errors.exchangeRules = '兑换规则不能超过200个字符';
    }
    
    if (formData.selectedChildIds.length === 0) {
      errors.selectedChildIds = '请至少选择一个孩子';
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
        childIds: this.data.formData.selectedChildIds,
        createdAt: new Date().toISOString(),
        isActive: this.data.formData.status === 'active'
      };
      
      // 移除不需要发送到后端的字段
      delete rewardData.selectedChildIds;
      
      wx.showLoading({ title: '保存中...' });
      
      const result = await rewardsApi.create(rewardData);
      
      if (result.code === 0) {
        wx.showToast({ 
          title: '奖励创建成功！', 
          icon: 'success' 
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.msg || '创建奖励失败');
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

  // 重置表单
  onReset: function() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有表单内容吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            formData: {
              name: '',
              description: '',
              pointsRequired: 50,
              category: 'toy',
              rewardType: 'physical',
              status: 'active',
              stock: 100,
              recommendedStock: 100,
              ageGroup: 'primary',
              habitTags: [],
              exchangeRules: '',
              selectedChildIds: [],
              emoji: '🎁',
              icon: ''
            },
            errors: {}
          });
          wx.showToast({ title: '表单已重置', icon: 'success' });
        }
      }
    });
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

  // 更新习惯标签显示状态
  updateHabitTagsDisplay: function() {
    const habitTagGroups = this.data.options.habitTagGroups;
    const selectedTags = this.data.formData.habitTags;
    
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
    const selectedChildIds = [...this.data.formData.selectedChildIds];
    
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
    const habitTags = [...this.data.formData.habitTags];
    
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

  // 返回
  onBack: function() {
    const { formData } = this.data;
    const hasChanges = formData.name || formData.description;
    
    if (hasChanges) {
      wx.showModal({
        title: '确认离开',
        content: '表单内容尚未保存，确定要离开吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  }
});