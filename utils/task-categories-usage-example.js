// 任务类别和标签统一配置使用示例
// 展示如何在各个页面中使用统一的配置

const { TaskCategoriesUtils, TASK_CATEGORIES, HABIT_TAGS } = require('./task-categories-config.js');

/**
 * 在页面中使用统一配置的示例
 */

// 1. 在任务添加/编辑页面中使用
const taskFormPageExample = {
  data: {
    // 使用统一配置获取选项数据
    categories: TaskCategoriesUtils.getCategoryOptions(),
    ageGroups: TaskCategoriesUtils.getAgeGroupOptions(),
    taskTypes: TaskCategoriesUtils.getTaskTypeOptions(),
    difficulties: TaskCategoriesUtils.getDifficultyOptions(),
    
    // 使用分组的习惯标签
    habitTagGroups: TaskCategoriesUtils.getGroupedHabitTags(),
    
    // 表单数据
    formData: {
      category: 'study',
      ageGroup: 'primary',
      taskType: 'daily',
      difficulty: 'easy'
    }
  },
  
  onLoad() {
    // 设置默认显示文本
    this.updateDisplayTexts();
  },
  
  // 更新显示文本
  updateDisplayTexts() {
    const { formData } = this.data;
    this.setData({
      categoryText: TaskCategoriesUtils.getCategoryText(formData.category),
      ageGroupText: TaskCategoriesUtils.getAgeGroupText(formData.ageGroup),
      taskTypeText: TaskCategoriesUtils.getTaskTypeText(formData.taskType),
      difficultyText: TaskCategoriesUtils.getDifficultyText(formData.difficulty),
      difficultyStars: TaskCategoriesUtils.getDifficultyStars(formData.difficulty)
    });
  },
  
  // 类别选择变化
  onCategoryChange(e) {
    const categoryCode = this.data.categories[e.detail.value].value;
    this.setData({
      'formData.category': categoryCode,
      categoryText: TaskCategoriesUtils.getCategoryText(categoryCode)
    });
  }
};

// 2. 在任务列表页面中使用
const taskListPageExample = {
  data: {
    tasks: [],
    // 筛选选项
    filterCategories: [
      { value: '', label: '全部类别' },
      ...TaskCategoriesUtils.getCategoryOptions()
    ]
  },
  
  // 格式化任务数据用于显示
  formatTaskForDisplay(task) {
    return {
      ...task,
      categoryText: TaskCategoriesUtils.getCategoryText(task.category),
      ageGroupText: TaskCategoriesUtils.getAgeGroupText(task.ageGroup),
      difficultyText: TaskCategoriesUtils.getDifficultyText(task.difficulty),
      difficultyStars: TaskCategoriesUtils.getDifficultyStars(task.difficulty),
      taskTypeText: TaskCategoriesUtils.getTaskTypeText(task.taskType)
    };
  },
  
  // 加载任务列表
  async loadTasks() {
    try {
      const result = await tasksApi.getList();
      if (result.code === 0) {
        const formattedTasks = result.data.map(task => this.formatTaskForDisplay(task));
        this.setData({ tasks: formattedTasks });
      }
    } catch (error) {
      console.error('加载任务失败:', error);
    }
  }
};

// 3. 在模板管理页面中使用
const templateManagementExample = {
  data: {
    templates: [],
    // 类别筛选
    categoryFilter: '',
    categories: TaskCategoriesUtils.getCategoryOptions()
  },
  
  // 获取类别统计
  getCategoryStats() {
    const stats = {};
    
    // 初始化所有类别的计数
    Object.keys(TASK_CATEGORIES).forEach(code => {
      stats[code] = {
        code,
        label: TASK_CATEGORIES[code].label,
        count: 0,
        emoji: TASK_CATEGORIES[code].emoji
      };
    });
    
    // 统计每个类别的模板数量
    this.data.templates.forEach(template => {
      if (stats[template.category]) {
        stats[template.category].count++;
      }
    });
    
    return Object.values(stats);
  },
  
  // 按类别筛选模板
  filterTemplatesByCategory(category) {
    if (!category) return this.data.templates;
    return this.data.templates.filter(template => template.category === category);
  }
};

// 4. 在统计分析页面中使用
const analyticsPageExample = {
  // 生成类别分布图表数据
  generateCategoryChartData(completionRecords) {
    const categoryStats = {};
    
    // 初始化类别统计
    Object.keys(TASK_CATEGORIES).forEach(code => {
      categoryStats[code] = {
        label: TASK_CATEGORIES[code].label,
        value: 0,
        color: TASK_CATEGORIES[code].color,
        emoji: TASK_CATEGORIES[code].emoji
      };
    });
    
    // 统计完成记录
    completionRecords.forEach(record => {
      if (categoryStats[record.task.category]) {
        categoryStats[record.task.category].value++;
      }
    });
    
    // 转换为图表数据格式
    return Object.values(categoryStats)
      .filter(stat => stat.value > 0)
      .sort((a, b) => b.value - a.value);
  },
  
  // 生成习惯标签云数据
  generateHabitTagCloud(tasks) {
    const tagStats = {};
    
    tasks.forEach(task => {
      if (task.habitTags && Array.isArray(task.habitTags)) {
        task.habitTags.forEach(tag => {
          tagStats[tag] = (tagStats[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(tagStats)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }
};

// 5. 在组件中使用
const taskCardComponentExample = {
  properties: {
    task: Object
  },
  
  data: {
    displayData: {}
  },
  
  observers: {
    'task': function(task) {
      if (task) {
        this.updateDisplayData();
      }
    }
  },
  
  methods: {
    updateDisplayData() {
      const task = this.data.task;
      const categoryInfo = TaskCategoriesUtils.getCategoryInfo(task.category);
      
      this.setData({
        displayData: {
          categoryText: TaskCategoriesUtils.getCategoryText(task.category),
          categoryEmoji: categoryInfo ? categoryInfo.emoji : '📝',
          categoryColor: categoryInfo ? categoryInfo.color : '#666',
          ageGroupText: TaskCategoriesUtils.getAgeGroupText(task.ageGroup),
          difficultyStars: TaskCategoriesUtils.getDifficultyStars(task.difficulty),
          taskTypeText: TaskCategoriesUtils.getTaskTypeText(task.taskType)
        }
      });
    }
  }
};

/**
 * 迁移指南：如何将现有页面迁移到统一配置
 */
const migrationGuide = {
  // 步骤1: 引入统一配置
  step1_import: `
    const { TaskCategoriesUtils } = require('../../utils/task-categories-config.js');
  `,
  
  // 步骤2: 替换硬编码的选项数据
  step2_replaceOptions: `
    // 旧代码
    categories: [
      { value: 'study', label: '学习' },
      { value: 'life', label: '生活' }
    ]
    
    // 新代码
    categories: TaskCategoriesUtils.getCategoryOptions()
  `,
  
  // 步骤3: 替换文本转换方法
  step3_replaceTextMethods: `
    // 旧代码
    getCategoryText(category) {
      const textMap = { 'study': '学习', 'life': '生活' };
      return textMap[category] || '未知';
    }
    
    // 新代码
    getCategoryText(category) {
      return TaskCategoriesUtils.getCategoryText(category);
    }
  `,
  
  // 步骤4: 使用统一的习惯标签
  step4_useHabitTags: `
    // 获取所有标签
    allTags: TaskCategoriesUtils.getAllHabitTags()
    
    // 获取分组标签
    tagGroups: TaskCategoriesUtils.getGroupedHabitTags()
  `
};

module.exports = {
  taskFormPageExample,
  taskListPageExample,
  templateManagementExample,
  analyticsPageExample,
  taskCardComponentExample,
  migrationGuide
};