// pages/rewards/add.js
// 添加奖励页面逻辑
const { rewardsApi } = require('../../utils/api-services.js');

Page({
  data: {
    loading: false,
    
    // 奖励表单数据
    formData: {
      name: '',
      description: '',
      pointsRequired: 50,
      category: 'toy',
      emoji: '🎁',
      icon: ''
    },
    
    // 选项数据
    options: {
      categories: [
        { value: 'toy', label: '玩具', emoji: '🧸' },
        { value: 'food', label: '美食', emoji: '🍎' },
        { value: 'activity', label: '活动', emoji: '🎮' },
        { value: 'privilege', label: '特权', emoji: '👑' },
        { value: 'outing', label: '外出', emoji: '🚗' },
        { value: 'digital', label: '数码', emoji: '📱' },
        { value: 'book', label: '书籍', emoji: '📚' },
        { value: 'clothing', label: '服装', emoji: '👕' },
        { value: 'experience', label: '体验', emoji: '🎪' },
        { value: 'other', label: '其他', emoji: '🎁' }
      ]
    },
    
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
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
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