// components/task-item/task-item.js
// 优化后的任务项组件逻辑
const { TaskCategoriesUtils } = require('../../utils/task-categories-config.js');

Component({
  options: {
    addGlobalClass: true
  },
  
  properties: {
    task: {
      type: Object,
      value: {}
    },
    showActions: {
      type: Boolean,
      value: true
    },
    showEditActions: {
      type: Boolean,
      value: false
    },
    isManageMode: {
      type: Boolean,
      value: false
    }
  },
  
  data: {
    expanded: false,
    challengeProgress: null,
    
    // 计算属性
    taskEmoji: '',
    difficultyStars: '',
    difficultyText: '',
    taskTypeText: '',
    categoryText: '',
    ageGroupText: '',
    cycleTypeText: '',
    completionTimeText: ''
  },
  
  lifetimes: {
    attached() {
      this.calculateChallengeProgress();
      this.updateComputedProperties();
    }
  },
  
  observers: {
    'task': function(newTask) {
      if (newTask) {
        this.calculateChallengeProgress();
        this.updateComputedProperties();
      }
    }
  },
  
  methods: {
    // 更新计算属性
    updateComputedProperties() {
      const task = this.data.task;
      if (!task) return;
      
      this.setData({
        taskEmoji: this.getTaskEmoji(task),
        difficultyStars: this.getDifficultyStars(task.difficulty),
        difficultyText: this.getDifficultyText(task.difficulty),
        taskTypeText: this.getTaskTypeText(task.taskType),
        categoryText: this.getCategoryText(task.category),
        ageGroupText: this.getAgeGroupText(task.ageGroup),
        cycleTypeText: this.getCycleTypeText(task.cycleType),
        completionTimeText: this.formatCompletionTime(task.completionRecord?.completeDate)
      });
    },
    
    // 计算挑战进度
    calculateChallengeProgress() {
      const task = this.data.task;
      if (!task.challengeTarget) return;
      
      // 这里可以根据实际的完成记录计算进度
      // 示例：假设有连续完成天数的记录
      const targetDays = task.challengeTarget.days || 0;
      const currentDays = this.getCurrentStreakDays(task);
      
      this.setData({
        challengeProgress: {
          current: currentDays,
          target: targetDays,
          percentage: Math.min((currentDays / targetDays) * 100, 100)
        }
      });
    },
    
    // 获取当前连续完成天数（示例方法）
    getCurrentStreakDays(task) {
      // 这里应该根据实际的完成记录来计算
      // 暂时返回模拟数据
      return Math.floor(Math.random() * (task.challengeTarget?.days || 10));
    },
    
    // 获取任务图标
    getTaskEmoji(task) {
      const emojiMap = {
        'study': '📚',
        'life': '🏠',
        'sport': '⚽',
        'health': '💪',
        'social': '👥',
        'creative': '🎨',
        'reading': '📖',
        'music': '🎵'
      };
      
      return task.emoji || emojiMap[task.category] || '📝';
    },
    
    // 获取难度星级
    getDifficultyStars(difficulty) {
      return TaskCategoriesUtils.getDifficultyStars(difficulty);
    },
    
    // 获取难度文本
    getDifficultyText(difficulty) {
      return TaskCategoriesUtils.getDifficultyText(difficulty);
    },
    
    // 获取任务类型文本
    getTaskTypeText(taskType) {
      return TaskCategoriesUtils.getTaskTypeText(taskType);
    },
    
    // 获取类别文本
    getCategoryText(category) {
      return TaskCategoriesUtils.getCategoryText(category);
    },
    
    // 获取年龄组文本
    getAgeGroupText(ageGroup) {
      return TaskCategoriesUtils.getAgeGroupText(ageGroup);
    },
    
    // 获取周期类型文本
    getCycleTypeText(cycleType) {
      const textMap = {
        'daily': '每天',
        'weekly': '每周',
        'monthly': '每月',
        'custom': '自定义'
      };
      return textMap[cycleType] || cycleType || '未设置';
    },
    
    // 格式化完成时间
    formatCompletionTime(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 1) return '刚刚完成';
      if (diffMins < 60) return `${diffMins}分钟前`;
      if (diffHours < 24) return `${diffHours}小时前`;
      if (diffDays < 7) return `${diffDays}天前`;
      
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    // 点击任务卡片
    onTaskTap() {
      // 可以用于展开/收起详细信息
      this.setData({
        expanded: !this.data.expanded
      });
      
      this.triggerEvent('tap', { 
        task: this.data.task,
        expanded: this.data.expanded
      });
    },
    
    // 显示提示信息
    onShowTips(e) {
      const tips = e.currentTarget.dataset.tips;
      
      wx.showModal({
        title: '💡 操作建议',
        content: tips,
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#667eea'
      });
      
      this.triggerEvent('showTips', { 
        task: this.data.task,
        tips: tips
      });
    },
    
    // 完成任务
    onComplete(e) {
      // 显示确认对话框
      wx.showModal({
        title: '确认完成',
        content: `确定要完成任务"${this.data.task.name}"吗？`,
        confirmText: '完成',
        confirmColor: '#667eea',
        success: (res) => {
          if (res.confirm) {
            // 显示加载状态
            wx.showLoading({
              title: '提交中...',
              mask: true
            });
            
            this.triggerEvent('complete', { 
              task: this.data.task 
            });
          }
        }
      });
    },
    
    // 编辑任务
    onEdit: function(e) {
      console.log('点击编辑任务按钮:', this.data.task);
      
      if (!this.data.task || !this.data.task._id) {
        wx.showToast({
          title: '任务信息错误',
          icon: 'none'
        });
        return;
      }

      // 将完整任务数据存储到全局数据管理器
      const app = getApp();
      if (app.globalData) {
        app.globalData.editTaskData = this.data.task;
      }
      
      wx.navigateTo({
        url: `/pages/tasks/edit?task=${this.data.task}&fromData=true`,
        success: () => {
          console.log('成功跳转到编辑任务页面');
        },
        fail: (error) => {
          console.error('跳转到编辑任务页面失败:', error);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
          // 如果跳转失败，回退到事件触发方式
          this.triggerEvent('edit', { task: this.data.task });
        }
      });
    },
    
    // 删除任务
    onDelete(e) {
      wx.showModal({
        title: '确认删除',
        content: `确定要删除任务"${this.data.task.name}"吗？此操作不可恢复。`,
        confirmText: '删除',
        confirmColor: '#dc3545',
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('delete', { 
              taskId: this.data.task._id,
              task: this.data.task 
            });
          }
        }
      });
    },
    
    // 查看任务详情
    onViewDetails(e) {
      this.triggerEvent('viewDetails', { task: this.data.task });
    },
    
    // 分享任务
    onShare(e) {
      this.triggerEvent('share', { task: this.data.task });
    }
  }
});