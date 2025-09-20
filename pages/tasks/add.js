// pages/tasks/add.js
// 添加任务页面逻辑
const { tasksApi, childrenApi, dictionaryApi } = require('../../utils/api-services.js');

Page({
  data: {
    loading: false,
    childId: '',
    childInfo: null,
    
    // 任务表单数据
    formData: {
      status: "string",           // 状态：active/inactive
      childIds: "array",          // 分配的儿童ID列表
      name: '',
      description: '',
      points: 0,
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
    
    // 表单验证
    errors: {}
  },

  onLoad: function (options) {
    const childId = options.childId;
    if (childId) {
      this.setData({ childId });
      this.loadChildInfo(childId);
    } else {
      wx.showToast({ title: '缺少孩子信息', icon: 'none' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 加载孩子信息
  loadChildInfo: async function(childId) {
    try {
      const result = await childrenApi.getById(childId);
      if (result.code === 0) {
        this.setData({ 
          childInfo: result.data,
          'formData.ageGroup': this.getAgeGroupByAge(result.data.age)
        });
      }
    } catch (error) {
      console.error('加载孩子信息失败:', error);
    }
  },

  // 根据年龄推荐年龄组
  getAgeGroupByAge: function(age) {
    if (age < 6) return 'preschool';
    if (age < 12) return 'primary';
    if (age < 15) return 'middle';
    return 'high';
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
        [`formData.${field}`]: selectedOption.value
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
      'formData.points': points
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
      'formData.habitTags': habitTags
    });
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
        ...this.data.formData,
        childId: this.data.childId,
        createdAt: new Date().toISOString(),
        isCompleted: false,
        completionRecord: null
      };
      
      wx.showLoading({ title: '保存中...' });
      
      const result = await tasksApi.create(taskData);
      
      if (result.code === 0) {
        wx.showToast({ 
          title: '任务创建成功！', 
          icon: 'success' 
        });
        
        // 延迟返回，让用户看到成功提示
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.msg || '创建任务失败');
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
              points: 10,
              difficulty: 'easy',
              category: 'study',
              taskType: 'daily',
              cycleType: 'daily',
              ageGroup: this.data.childInfo ? this.getAgeGroupByAge(this.data.childInfo.age) : 'primary',
              tips: '',
              habitTags: [],
              emoji: '📚'
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
    if (this.hasFormChanged()) {
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
  },

  // 检查表单是否有变化
  hasFormChanged: function() {
    const { formData } = this.data;
    return formData.name || formData.description || formData.habitTags.length > 0;
  }
});