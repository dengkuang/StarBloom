// pages/tasks/add.js
// 添加任务页面逻辑
const { tasksApi, childrenApi, dictionaryApi } = require('../../utils/api-services.js');
const taskDataManager = require('../../utils/task-data-manager.js');

Page({
  data: {
    loading: false,
    childId: '',
    childInfo: null,
    childrenList: [],           // 所有孩子列表
    
    // 任务表单数据
    formData: {
      status: "active",           // 状态：active/inactive
      selectedChildIds: [],       // 选中的儿童ID列表
      name: '',
      description: '',
      points: 10,
      difficulty: 'easy',
      category: 'study',
      taskType: 'daily',
      ageGroup: 'primary',
      tips: '',
      habitTags: [],
      emoji: '📚'
    },
    
    // 选项数据
    options: {
      difficultys: [
        { value: 'easy', label: '简单', stars: '⭐' },
        { value: 'medium', label: '中等', stars: '⭐⭐' },
        { value: 'hard', label: '困难', stars: '⭐⭐⭐' }
      ],
      categorys: [
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

      ageGroups: [
        { value: 'preschool', label: '学前(3-6岁)' },
        { value: 'primary', label: '小学(6-12岁)' },
        { value: 'middle', label: '中学(12-15岁)' },
        { value: 'high', label: '高中(15-18岁)' }
      ],
      emojis: [
        '📚', '🏠', '⚽', '💪', '👥', '🎨', '📖', '🎵',
        '📋', '🧹', '🛠️', '💰', '🍎', '🌟', '🎯', '🏆',
        '⏰', '🎪', '🌈', '🚀', '💡', '🎁', '🌸', '🦋'
      ]
    },
    
    // 常用习惯标签（与项目模板保持一致）
    commonHabitTags: [
      // 基础生活习惯
      '卫生', '自理', '整理', '独立', '健康', '作息',
      // 学习相关
      '学习', '阅读', '书写', '练习', '知识', '专注', '自律',
      // 品格培养  
      '责任感', '礼貌', '分享', '友善', '关爱', '理财', '规划',
      // 社交协作
      '社交', '协作', '友谊', '亲子',
      // 技能发展
      '技能', '艺术', '创意', '运动',
      // 其他
      '准备', '游戏', '认可', '成就'
    ],
    
    // 习惯标签显示数据（包含选中状态）
    habitTagsDisplay: [],
    
    // 表单验证
    errors: {},
    
    // 计算属性 - 当前选中项的显示文本
    currentDifficultyText: '⭐ 简单',
    currentCategoryText: '学习',
    currentTaskTypeText: '每日任务',
    currentAgeGroupText: '小学(6-12岁)',
    currentCycleTypeText: '每天'
  },

  onLoad: function (options) {
    const childId = options.childId;
    
    // 初始化计算属性
    this.updateComputedTexts();
    
    // 初始化习惯标签显示数据
    this.updateHabitTagsDisplay();
    
    // 加载所有孩子列表
    this.loadChildrenList().then(() => {
      // 如果传入了特定孩子ID，则默认选中该孩子
      if (childId) {
        this.setData({ 
          childId,
          'formData.selectedChildIds': [childId]
        });
        this.updateChildrenSelection();
        this.loadChildInfo(childId);
      }
    });
  },

  // 加载所有孩子列表
  loadChildrenList: async function() {
    try {
      const result = await childrenApi.getList();
      if (result.code === 0) {
        // 为每个孩子添加选中状态
        const childrenWithSelection = result.data.map(child => ({
          ...child,
          isSelected: false
        }));
        
        this.setData({ childrenList: childrenWithSelection });
        
        // 如果只有一个孩子，默认选中
        if (result.data.length === 1 && this.data.formData.selectedChildIds.length === 0) {
          this.setData({
            'formData.selectedChildIds': [result.data[0]._id]
          });
          this.updateChildrenSelection();
        }
        
        return Promise.resolve();
      }
    } catch (error) {
      console.error('加载孩子列表失败:', error);
      wx.showToast({ title: '加载孩子列表失败', icon: 'none' });
      return Promise.reject(error);
    }
  },

  // 更新孩子选择状态
  updateChildrenSelection: function() {
    const { childrenList, formData } = this.data;
    const updatedChildren = childrenList.map(child => ({
      ...child,
      isSelected: formData.selectedChildIds.includes(child._id)
    }));
    
    this.setData({ childrenList: updatedChildren });
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

  // 孩子选择切换
  onChildToggle: function(e) {
    const { childId } = e.currentTarget.dataset;
    const selectedChildIds = [...this.data.formData.selectedChildIds];
    const index = selectedChildIds.indexOf(childId);
    
    console.log('🔍 [DEBUG] 孩子选择切换 - childId:', childId);
    console.log('🔍 [DEBUG] 当前选中列表:', selectedChildIds);
    console.log('🔍 [DEBUG] 在列表中的索引:', index);
    
    if (index > -1) {
      // 取消选择
      selectedChildIds.splice(index, 1);
      console.log('🔍 [DEBUG] 取消选择后:', selectedChildIds);
    } else {
      // 添加选择
      selectedChildIds.push(childId);
      console.log('🔍 [DEBUG] 添加选择后:', selectedChildIds);
    }
    
    this.setData({
      'formData.selectedChildIds': selectedChildIds
    });
    
    console.log('🔍 [DEBUG] setData后的formData.selectedChildIds:', this.data.formData.selectedChildIds);
    
    // 更新孩子选择状态显示
    this.updateChildrenSelection();
    
    // 如果选中了孩子，更新年龄组建议
    if (selectedChildIds.length > 0) {
      this.updateAgeGroupSuggestion(selectedChildIds);
    }
  },

  // 根据选中的孩子更新年龄组建议
  updateAgeGroupSuggestion: function(selectedChildIds) {
    const selectedChildren = this.data.childrenList.filter(child => 
      selectedChildIds.includes(child._id)
    );
    
    if (selectedChildren.length > 0) {
      // 取最小年龄作为建议
      const minAge = Math.min(...selectedChildren.map(child => child.age));
      const suggestedAgeGroup = this.getAgeGroupByAge(minAge);
      
      this.setData({
        'formData.ageGroup': suggestedAgeGroup
      });
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
      
      // 更新计算属性
      this.updateComputedTexts();
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
      'formData.habitTags': habitTags
    });
    
    // 更新显示状态
    this.updateHabitTagsDisplay();
  },

  // Emoji选择
  onEmojiSelect: function(e) {
    const { emoji } = e.currentTarget.dataset;
    this.setData({
      'formData.emoji': emoji
    });
  },

  // 更新计算属性
  updateComputedTexts: function() {
    const { formData, options } = this.data;
    
    // 难度文本
    const difficultyOption = options.difficultys.find(item => item.value === formData.difficulty);
    const currentDifficultyText = difficultyOption ? `${difficultyOption.stars} ${difficultyOption.label}` : '⭐ 简单';
    
    // 类别文本
    const categoryOption = options.categorys.find(item => item.value === formData.category);
    const currentCategoryText = categoryOption ? categoryOption.label : '学习';
    
    // 任务类型文本
    const taskTypeOption = options.taskTypes.find(item => item.value === formData.taskType);
    const currentTaskTypeText = taskTypeOption ? taskTypeOption.label : '每日任务';
    
    // 年龄组文本
    const ageGroupOption = options.ageGroups.find(item => item.value === formData.ageGroup);
    const currentAgeGroupText = ageGroupOption ? ageGroupOption.label : '小学(6-12岁)';
    
    this.setData({
      currentDifficultyText,
      currentCategoryText,
      currentTaskTypeText,
      currentAgeGroupText
    });
  },

  // 表单验证
  validateForm: function() {
    const { formData } = this.data;
    const errors = {};
    
    if (formData.selectedChildIds.length === 0) {
      wx.showToast({ title: '请至少选择一个孩子', icon: 'none' });
      return false;
    }
    
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
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const { formData } = this.data;
      
      // 调试日志：检查选中的孩子ID
      console.log('🔍 [DEBUG] 选中的孩子ID列表:', formData.selectedChildIds);
      console.log('🔍 [DEBUG] 选中孩子数量:', formData.selectedChildIds.length);
      
      const taskData = {
        name: formData.name,
        description: formData.description,
        points: formData.points,
        difficulty: formData.difficulty,
        category: formData.category,
        taskType: formData.taskType,
        ageGroup: formData.ageGroup,
        tips: formData.tips,
        habitTags: formData.habitTags,
        emoji: formData.emoji,
        status: formData.status,
        childIds: formData.selectedChildIds,  // 使用选中的孩子ID列表
        createdAt: new Date().toISOString(),
        isCompleted: false,
        completionRecord: null
      };
      
      // 调试日志：检查最终的任务数据
      console.log('🔍 [DEBUG] 最终任务数据:', taskData);
      console.log('🔍 [DEBUG] taskData.childIds:', taskData.childIds);
      console.log('🔍 [DEBUG] taskData.childIds 是否为数组:', Array.isArray(taskData.childIds));
      console.log('🔍 [DEBUG] JSON.stringify(taskData.childIds):', JSON.stringify(taskData.childIds));
      
      // 额外验证：确保childIds是数组且不为空
      if (!Array.isArray(taskData.childIds) || taskData.childIds.length === 0) {
        console.error('❌ [ERROR] childIds 不是有效数组或为空!');
        wx.showToast({ title: 'childIds数据异常，请重新选择孩子', icon: 'none' });
        return;
      }
      
      wx.showLoading({ title: '保存中...' });
      
      const result = await tasksApi.create(taskData);
      
      if (result.code === 0) {
        const selectedCount = formData.selectedChildIds.length;
        wx.showToast({ 
          title: `任务已分配给${selectedCount}个孩子！`, 
          icon: 'success' 
        });
        
        // 触发任务数据更新事件
        taskDataManager.forceRefreshTaskData();
        
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
          // 保留原来传入的孩子ID（如果有的话）
          const defaultSelectedChildIds = this.data.childId ? [this.data.childId] : [];
          
          this.setData({
            formData: {
              status: 'active',
              selectedChildIds: defaultSelectedChildIds,
              name: '',
              description: '',
              points: 10,
              difficulty: 'easy',
              category: 'study',
              taskType: 'daily',
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