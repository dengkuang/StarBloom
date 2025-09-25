// pages/tasks/edit.js
// 编辑任务页面逻辑
const { tasksApi, childrenApi } = require('../../utils/api-services.js');

Page({
  data: {
    loading: false,
    taskId: '',
    taskInfo: null,
    childInfo: null,
    
    // 任务表单数据
    formData: {
      name: '',
      description: '',
      points: 10,
      difficulty: 'easy',
      category: 'study',
      taskType: 'daily',
      cycleType: 'daily',
      ageGroup: 'primary',
      tips: '',
      habitTags: [],
      emoji: '📚'
    },
    
    // 选项数据
    options: {
      difficulties: [
        { value: 'easy', label: '简单', stars: '⭐' },
        { value: 'medium', label: '中等', stars: '⭐⭐' },
        { value: 'hard', label: '困难', stars: '⭐⭐⭐' }
      ],
      categories: [
        { value: 'study', label: '学习', emoji: '📚' },
        { value: 'life', label: '生活', emoji: '🏠' },
        { value: 'sport', label: '运动', emoji: '⚽' },
        { value: 'health', label: '健康', emoji: '💪' },
        { value: 'social', label: '社交', emoji: '👥' },
        { value: 'creative', label: '创意', emoji: '🎨' },
        { value: 'reading', label: '阅读', emoji: '📖' },
        { value: 'music', label: '音乐', emoji: '🎵' },
        { value: 'organization', label: '整理', emoji: '📋' },
        { value: 'housework', label: '家务', emoji: '🧹' },
        { value: 'skill', label: '技能', emoji: '🛠️' },
        { value: 'financial', label: '理财', emoji: '💰' }
      ],
      taskTypes: [
        { value: 'daily', label: '每日任务' },
        { value: 'weekly', label: '每周任务' },
        { value: 'monthly', label: '每月任务' },
        { value: 'once', label: '一次性任务' }
      ],
      cycleTypes: [
        { value: 'daily', label: '每天' },
        { value: 'weekly', label: '每周' },
        { value: 'monthly', label: '每月' },
        { value: 'custom', label: '自定义' }
      ],
      ageGroups: [
        { value: 'preschool', label: '学前(3-6岁)' },
        { value: 'primary', label: '小学(6-12岁)' },
        { value: 'middle', label: '中学(12-15岁)' },
        { value: 'high', label: '高中(15-18岁)' }
      ]
    },
    
    // 常用习惯标签
    commonHabitTags: [
      '坚持', '专注', '独立', '整洁', '守时', '礼貌', 
      '分享', '合作', '创新', '思考', '耐心', '勇敢'
    ],
    
    // 习惯标签显示数据（包含选中状态）
    habitTagsDisplay: [],
    
    // 表单验证
    errors: {},
    
    // 是否有修改
    hasChanges: false
  },

  onLoad: function(options) {
    console.log('编辑任务页面加载，参数:', options);
    
    if (options.id) {
      this.setData({ taskId: options.id });
    }
    
    // 检查是否有传递的数据
    const app = getApp();
    const fromData = options.fromData === 'true';
    
    if (fromData && app.globalData && app.globalData.editTaskData) {
      // 使用传递的数据，避免API调用
      console.log('使用传递的任务数据:', app.globalData.editTaskData);
      this.setTaskData(app.globalData.editTaskData);
      
      // 清除全局数据
      delete app.globalData.editTaskData;
    } else if (options.id) {
      // 回退到API调用方式
      console.log('使用API加载任务数据');
      this.loadTaskInfo(options.id);
    } else {
      console.error('缺少任务ID参数');
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 设置任务数据的通用方法
  setTaskData: function(taskData) {
    console.log('设置任务数据:', taskData);
    
    this.setData({
      formData: taskData
      
    });

    // 更新习惯标签显示状态
    this.updateHabitTagsDisplay();

    // 如果有孩子ID，加载孩子信息
    if (taskData.childId) {
      this.loadChildInfo(taskData.childId);
    }
  },

 

 

  // 表单输入处理
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value,
      [`errors.${field}`]: '', // 清除错误信息
      hasChanges: true
    });
  },

  // Textarea 焦点事件处理（官方推荐）
  onTextareaFocus: function(e) {
    console.log('Textarea focused:', e.detail);
    // 可以在这里处理焦点获得时的逻辑
  },

  // Textarea 失焦事件处理（官方推荐）
  onTextareaBlur: function(e) {
    console.log('Textarea blurred:', e.detail);
    // 可以在这里处理失焦时的逻辑，比如保存草稿
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
        hasChanges: true
      });
      
      // 如果是类别选择，同时更新emoji
      if (field === 'category') {
        this.setData({
          'formData.emoji': selectedOption.emoji
        });
      }
    }
  },

  // 积分调整
  onPointsChange: function(e) {
    const { type } = e.currentTarget.dataset;
    let points = this.data.formData.points;
    
    if (type === 'increase') {
      points = Math.min(points + 5, 100);
    } else {
      points = Math.max(points - 5, 5);
    }
    
    this.setData({
      'formData.points': points,
      hasChanges: true
    });
  },

  // 更新习惯标签显示数据
  updateHabitTagsDisplay: function() {
    const selectedTags = this.data.formData.habitTags || [];
    const habitTagsDisplay = this.data.commonHabitTags.map(tag => ({
      name: tag,
      selected: selectedTags.includes(tag)
    }));
    
    this.setData({
      habitTagsDisplay: habitTagsDisplay
    });
  },

  // 习惯标签切换
  onHabitTagToggle: function(e) {
    const { tag } = e.currentTarget.dataset;
    const habitTags = [...this.data.formData.habitTags];
    const index = habitTags.indexOf(tag);
    
    if (index > -1) {
      habitTags.splice(index, 1);
    } else {
      if (habitTags.length < 5) { // 最多5个标签
        habitTags.push(tag);
      } else {
        wx.showToast({ title: '最多选择5个标签', icon: 'none' });
        return;
      }
    }
    
    this.setData({
      'formData.habitTags': habitTags,
      hasChanges: true
    });
    
    // 更新显示状态
    this.updateHabitTagsDisplay();
  },

  // 表单验证
  validateForm: function() {
    const { formData } = this.data;
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = '请输入任务名称';
    }
    
    if (formData.name.length > 20) {
      errors.name = '任务名称不能超过20个字符';
    }
    
    if (formData.description && formData.description.length > 100) {
      errors.description = '任务描述不能超过100个字符';
    }
    
    if (formData.points < 5 || formData.points > 100) {
      errors.points = '积分必须在5-100之间';
    }
    
    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  // 保存任务
  onSave: async function() {
    if (!this.validateForm()) {
      wx.showToast({ title: '请检查表单信息', icon: 'none' });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const taskData = {
        ...this.data.taskInfo,
        ...this.data.formData,
        updatedAt: new Date().toISOString()
      };
      
      wx.showLoading({ title: '保存中...' });
      
      const result = await tasksApi.update(this.data.taskId, taskData);
      
      if (result.code === 0) {
        wx.showToast({ 
          title: '任务更新成功！', 
          icon: 'success' 
        });
        
        this.setData({ hasChanges: false });
        
        // 延迟返回，让用户看到成功提示
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.msg || '更新任务失败');
      }
      
    } catch (error) {
      console.error('保存任务失败:', error);
      wx.showToast({ 
        title: error.message || '保存失败，请重试', 
        icon: 'none' 
      });
    } finally {
      wx.hideLoading();
      this.setData({ loading: false });
    }
  },

  // 删除任务
  onDelete: function() {
    wx.showModal({
      title: '确认删除',
      content: `确定要删除任务"${this.data.formData.name}"吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#dc3545',
      success: async (res) => {
        if (res.confirm) {
          await this.deleteTask();
        }
      }
    });
  },

  // 执行删除
  deleteTask: async function() {
    try {
      wx.showLoading({ title: '删除中...' });
      
      const result = await tasksApi.delete(this.data.taskId);
      
      if (result.code === 0) {
        wx.showToast({ 
          title: '任务删除成功', 
          icon: 'success' 
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.msg || '删除任务失败');
      }
      
    } catch (error) {
      console.error('删除任务失败:', error);
      wx.showToast({ 
        title: error.message || '删除失败，请重试', 
        icon: 'none' 
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 重置表单
  onReset: function() {
    if (!this.data.taskInfo) return;
    
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有修改吗？',
      success: (res) => {
        if (res.confirm) {
          const taskInfo = this.data.taskInfo;
          this.setData({
            formData: {
              name: taskInfo.name || '',
              description: taskInfo.description || '',
              points: taskInfo.points || 10,
              difficulty: taskInfo.difficulty || 'easy',
              category: taskInfo.category || 'study',
              taskType: taskInfo.taskType || 'daily',
              cycleType: taskInfo.cycleType || 'daily',
              ageGroup: taskInfo.ageGroup || 'primary',
              tips: taskInfo.tips || '',
              habitTags: taskInfo.habitTags || [],
              emoji: taskInfo.emoji || '📚'
            },
            errors: {},
            hasChanges: false
          });
          wx.showToast({ title: '表单已重置', icon: 'success' });
        }
      }
    });
  },

  // 返回
  onBack: function() {
    if (this.data.hasChanges) {
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