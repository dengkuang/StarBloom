// 模板导入页面
Page({
  data: {
    importing: false,
    taskTemplates3_6Imported: false,
    rewardTemplates3_6Imported: false,
    taskTemplates6_9Imported: false,
    rewardTemplates6_9Imported: false,
    importLog: []
  },

  onLoad() {
    this.addLog('页面加载完成', 'info');
  },

  // 添加日志
  addLog(message, type = 'info') {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    this.setData({
      importLog: [...this.data.importLog, {
        time,
        message,
        type
      }]
    });
  },

  // 导入3-6岁任务模板
  async importTaskTemplates3_6() {
    const templates = [
      {
        templateId: "task_template_3_6_001",
        name: "刷牙洗脸",
        description: "每天早晚刷牙洗脸，保持口腔和面部清洁",
        category: "hygiene",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        taskType: "daily",

        points: 5,
        habitTags: ["卫生", "自理"],
        tips: "可以唱刷牙歌，让刷牙变得更有趣",
        difficulty: "easy",
        challengeTarget: { days: 7, description: "连续7天完成" },
        challengeReward: { points: 20, description: "额外奖励20积分" },
        isActive: true,
        sort_order: 1,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_3_6_002",
        name: "收拾玩具",
        description: "玩完玩具后主动收拾整理，放回原位",
        category: "organization",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        taskType: "daily",

        points: 8,
        habitTags: ["整理", "责任感"],
        tips: "可以和孩子一起制作玩具收纳标签，让收拾变得简单",
        difficulty: "easy",
        challengeTarget: { days: 5, description: "连续5天完成" },
        challengeReward: { points: 15, description: "额外奖励15积分" },
        isActive: true,
        sort_order: 2,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_3_6_003",
        name: "自己穿衣服",
        description: "尝试自己穿衣服和鞋子，培养独立能力",
        category: "self_care",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        taskType: "daily",

        points: 10,
        habitTags: ["自理", "独立"],
        tips: "选择容易穿脱的衣服，给孩子充足的时间",
        difficulty: "medium",
        challengeTarget: { days: 3, description: "连续3天独立完成" },
        challengeReward: { points: 25, description: "额外奖励25积分" },
        isActive: true,
        sort_order: 3,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_3_6_004",
        name: "帮忙做家务",
        description: "帮助家长做简单的家务，如摆放餐具、擦桌子",
        category: "housework",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        taskType: "daily",

        points: 12,
        habitTags: ["责任感", "协作"],
        tips: "选择安全简单的家务，多鼓励少批评",
        difficulty: "medium",
        challengeTarget: { days: 7, description: "一周内完成5次" },
        challengeReward: { points: 30, description: "额外奖励30积分" },
        isActive: true,
        sort_order: 4,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_3_6_005",
        name: "礼貌用语",
        description: "主动说请、谢谢、对不起等礼貌用语",
        category: "social",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        taskType: "daily",

        points: 6,
        habitTags: ["礼貌", "社交"],
        tips: "家长要以身作则，多使用礼貌用语",
        difficulty: "easy",
        challengeTarget: { days: 10, description: "连续10天记住使用" },
        challengeReward: { points: 40, description: "额外奖励40积分" },
        isActive: true,
        sort_order: 5,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_3_6_006",
        name: "安静午睡",
        description: "中午按时午睡，保证充足的休息时间",
        category: "health",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        taskType: "daily",

        points: 8,
        habitTags: ["健康", "作息"],
        tips: "营造安静舒适的午睡环境，可以播放轻柔音乐",
        difficulty: "easy",
        challengeTarget: { days: 7, description: "连续7天按时午睡" },
        challengeReward: { points: 25, description: "额外奖励25积分" },
        isActive: true,
        sort_order: 6,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_3_6_007",
        name: "分享玩具",
        description: "和小朋友或兄弟姐妹分享自己的玩具",
        category: "social",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        taskType: "weekly",
        points: 15,
        habitTags: ["分享", "友善"],
        tips: "引导孩子理解分享的快乐，不要强迫",
        difficulty: "medium",
        challengeTarget: { weeks: 2, description: "两周内主动分享3次" },
        challengeReward: { points: 50, description: "额外奖励50积分" },
        isActive: true,
        sort_order: 7,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_3_6_008",
        name: "听故事不打断",
        description: "听家长讲故事时保持安静，不随意打断",
        category: "learning",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        taskType: "daily",

        points: 7,
        habitTags: ["专注", "礼貌"],
        tips: "选择孩子感兴趣的故事，适当互动",
        difficulty: "medium",
        challengeTarget: { days: 5, description: "连续5天专心听故事" },
        challengeReward: { points: 20, description: "额外奖励20积分" },
        isActive: true,
        sort_order: 8,
        usage_count: 0,
        version: 1
      }
    ];

    await this.batchImportTemplates(templates, 'task', '3-6岁任务模板');
    this.setData({ taskTemplates3_6Imported: true });
  },

  // 导入3-6岁奖励模板
  async importRewardTemplates3_6() {
    const templates = [
      {
        templateId: "reward_template_3_6_001",
        name: "小贴纸",
        description: "获得一张可爱的小贴纸，可以贴在贴纸册上",
        category: "stickers",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        rewardType: "physical",
        pointsRequired: 20,
        habitTags: ["奖励", "收集"],
        exchangeRules: "需要家长发放，建议准备各种图案的贴纸",
        recommendedStock: 100,
        imageUrl: "",
        isActive: true,
        sort_order: 1,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_3_6_002",
        name: "额外故事时间",
        description: "睡前可以多听一个故事",
        category: "privilege",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        rewardType: "privilege",
        pointsRequired: 30,
        habitTags: ["特权", "阅读"],
        exchangeRules: "家长陪伴讲故事，时间控制在10-15分钟",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 2,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_3_6_003",
        name: "选择今天的零食",
        description: "可以自己选择今天想吃的健康零食",
        category: "food",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        rewardType: "privilege",
        pointsRequired: 25,
        habitTags: ["选择权", "食物"],
        exchangeRules: "在家长提供的健康零食范围内选择",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 3,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_3_6_004",
        name: "小玩具",
        description: "获得一个小玩具作为奖励",
        category: "toys",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        rewardType: "physical",
        pointsRequired: 80,
        habitTags: ["玩具", "奖励"],
        exchangeRules: "建议选择益智类或创意类小玩具",
        recommendedStock: 20,
        imageUrl: "",
        isActive: true,
        sort_order: 4,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_3_6_005",
        name: "和爸爸妈妈一起做游戏",
        description: "获得30分钟和父母一起玩游戏的时间",
        category: "activity",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        rewardType: "experience",
        pointsRequired: 40,
        habitTags: ["亲子", "游戏"],
        exchangeRules: "家长陪伴进行亲子游戏，增进感情",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 5,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_3_6_006",
        name: "选择今天穿的衣服",
        description: "可以自己选择今天想穿的衣服",
        category: "privilege",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        rewardType: "privilege",
        pointsRequired: 15,
        habitTags: ["选择权", "独立"],
        exchangeRules: "在合适的衣服范围内让孩子自主选择",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 6,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_3_6_007",
        name: "画画时间",
        description: "获得30分钟自由画画的时间和材料",
        category: "creative",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        rewardType: "experience",
        pointsRequired: 35,
        habitTags: ["创意", "艺术"],
        exchangeRules: "提供安全的画画材料，鼓励自由创作",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 7,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_3_6_008",
        name: "特殊表扬",
        description: "在家人面前得到特别的表扬和鼓励",
        category: "recognition",
        ageGroup: "preschool",
        ageRange: { min: 3, max: 6 },
        rewardType: "virtual",
        pointsRequired: 10,
        habitTags: ["表扬", "认可"],
        exchangeRules: "在家庭聚餐或聚会时公开表扬孩子的进步",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 8,
        usage_count: 0,
        version: 1
      }
    ];

    await this.batchImportTemplates(templates, 'reward', '3-6岁奖励模板');
    this.setData({ rewardTemplates3_6Imported: true });
  },

  // 导入6-9岁任务模板
  async importTaskTemplates6_9() {
    const templates = [
      {
        templateId: "task_template_6_9_001",
        name: "按时完成作业",
        description: "每天按时完成学校布置的作业，保持良好的学习习惯",
        category: "study",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        taskType: "daily",

        points: 15,
        habitTags: ["学习", "自律"],
        tips: "建议设置固定的作业时间，创造安静的学习环境",
        difficulty: "medium",
        challengeTarget: { days: 10, description: "连续10天按时完成" },
        challengeReward: { points: 50, description: "额外奖励50积分" },
        isActive: true,
        sort_order: 1,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_6_9_002",
        name: "整理书包",
        description: "每天晚上整理好书包，准备好第二天的学习用品",
        category: "organization",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        taskType: "daily",

        points: 8,
        habitTags: ["整理", "准备"],
        tips: "可以制作一个检查清单，确保不遗漏任何物品",
        difficulty: "easy",
        challengeTarget: { days: 7, description: "连续7天独立完成" },
        challengeReward: { points: 25, description: "额外奖励25积分" },
        isActive: true,
        sort_order: 2,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_6_9_003",
        name: "阅读课外书",
        description: "每天阅读课外书籍至少20分钟",
        category: "reading",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        taskType: "daily",

        points: 12,
        habitTags: ["阅读", "知识"],
        tips: "选择适合年龄的有趣书籍，可以和孩子讨论书中内容",
        difficulty: "medium",
        challengeTarget: { days: 14, description: "连续14天坚持阅读" },
        challengeReward: { points: 60, description: "额外奖励60积分" },
        isActive: true,
        sort_order: 3,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_6_9_004",
        name: "帮助做家务",
        description: "主动帮助家长做家务，如洗碗、扫地、整理房间",
        category: "housework",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        taskType: "daily",

        points: 18,
        habitTags: ["责任感", "协作"],
        tips: "根据孩子能力分配合适的家务，多鼓励少批评",
        difficulty: "medium",
        challengeTarget: { days: 7, description: "一周内完成5次" },
        challengeReward: { points: 40, description: "额外奖励40积分" },
        isActive: true,
        sort_order: 4,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_6_9_005",
        name: "练习写字",
        description: "每天练习写字15分钟，提高书写能力",
        category: "study",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        taskType: "daily",

        points: 10,
        habitTags: ["书写", "练习"],
        tips: "注意坐姿和握笔姿势，从简单的字开始练习",
        difficulty: "medium",
        challengeTarget: { days: 10, description: "连续10天坚持练习" },
        challengeReward: { points: 35, description: "额外奖励35积分" },
        isActive: true,
        sort_order: 5,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_6_9_006",
        name: "运动锻炼",
        description: "每天进行30分钟的体育运动或户外活动",
        category: "health",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        taskType: "daily",

        points: 15,
        habitTags: ["健康", "运动"],
        tips: "可以是跑步、跳绳、踢球等，注意安全",
        difficulty: "easy",
        challengeTarget: { days: 7, description: "连续7天坚持运动" },
        challengeReward: { points: 45, description: "额外奖励45积分" },
        isActive: true,
        sort_order: 6,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_6_9_007",
        name: "学习新技能",
        description: "每周学习一项新技能，如画画、音乐、手工等",
        category: "skill",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        taskType: "weekly",
        points: 25,
        habitTags: ["技能", "学习"],
        tips: "根据孩子兴趣选择，不要给太大压力",
        difficulty: "hard",
        challengeTarget: { weeks: 4, description: "一个月内学会一项新技能" },
        challengeReward: { points: 100, description: "额外奖励100积分" },
        isActive: true,
        sort_order: 7,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_6_9_008",
        name: "关心他人",
        description: "主动关心家人朋友，帮助需要帮助的人",
        category: "social",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        taskType: "weekly",
        points: 20,
        habitTags: ["关爱", "社交"],
        tips: "引导孩子观察身边人的需要，培养同理心",
        difficulty: "medium",
        challengeTarget: { weeks: 2, description: "两周内主动关心他人3次" },
        challengeReward: { points: 60, description: "额外奖励60积分" },
        isActive: true,
        sort_order: 8,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_6_9_009",
        name: "管理零花钱",
        description: "学会合理规划和使用零花钱，记录支出",
        category: "financial",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        taskType: "weekly",
        points: 22,
        habitTags: ["理财", "规划"],
        tips: "教导孩子区分需要和想要，培养储蓄习惯",
        difficulty: "hard",
        challengeTarget: { weeks: 4, description: "一个月内合理管理零花钱" },
        challengeReward: { points: 80, description: "额外奖励80积分" },
        isActive: true,
        sort_order: 9,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "task_template_6_9_010",
        name: "早睡早起",
        description: "每天按时睡觉和起床，保持良好的作息习惯",
        category: "health",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        taskType: "daily",

        points: 12,
        habitTags: ["健康", "作息"],
        tips: "制定合理的作息时间表，睡前避免过度兴奋",
        difficulty: "medium",
        challengeTarget: { days: 14, description: "连续14天保持良好作息" },
        challengeReward: { points: 55, description: "额外奖励55积分" },
        isActive: true,
        sort_order: 10,
        usage_count: 0,
        version: 1
      }
    ];

    await this.batchImportTemplates(templates, 'task', '6-9岁任务模板');
    this.setData({ taskTemplates6_9Imported: true });
  },

  // 导入6-9岁奖励模板
  async importRewardTemplates6_9() {
    const templates = [
      {
        templateId: "reward_template_6_9_001",
        name: "额外游戏时间",
        description: "获得30分钟额外的电子游戏或娱乐时间",
        category: "entertainment",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        rewardType: "privilege",
        pointsRequired: 50,
        habitTags: ["娱乐", "特权"],
        exchangeRules: "需要家长监督，注意保护视力",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 1,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_6_9_002",
        name: "选择周末活动",
        description: "可以选择这个周末的家庭活动内容",
        category: "privilege",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        rewardType: "privilege",
        pointsRequired: 80,
        habitTags: ["选择权", "活动"],
        exchangeRules: "在合理范围内让孩子选择周末活动",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 2,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_6_9_003",
        name: "新书籍",
        description: "获得一本自己喜欢的新书籍",
        category: "books",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        rewardType: "physical",
        pointsRequired: 120,
        habitTags: ["阅读", "知识"],
        exchangeRules: "可以让孩子自己选择感兴趣的书籍",
        recommendedStock: 30,
        imageUrl: "",
        isActive: true,
        sort_order: 3,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_6_9_004",
        name: "学习用品",
        description: "获得新的学习用品，如彩色笔、笔记本等",
        category: "study_supplies",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        rewardType: "physical",
        pointsRequired: 60,
        habitTags: ["学习", "用品"],
        exchangeRules: "选择实用且孩子喜欢的学习用品",
        recommendedStock: 50,
        imageUrl: "",
        isActive: true,
        sort_order: 4,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_6_9_005",
        name: "和朋友聚会",
        description: "可以邀请好朋友来家里玩或一起外出活动",
        category: "social",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        rewardType: "experience",
        pointsRequired: 100,
        habitTags: ["社交", "友谊"],
        exchangeRules: "需要家长安排和监督，确保安全",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 5,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_6_9_006",
        name: "零花钱",
        description: "获得额外的零花钱奖励",
        category: "money",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        rewardType: "privilege",
        pointsRequired: 90,
        habitTags: ["金钱", "奖励"],
        exchangeRules: "金额适中，教导孩子合理使用",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 6,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_6_9_007",
        name: "特殊晚餐",
        description: "可以选择今天晚餐吃什么，或去喜欢的餐厅",
        category: "food",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        rewardType: "privilege",
        pointsRequired: 70,
        habitTags: ["食物", "选择权"],
        exchangeRules: "在健康饮食的前提下让孩子选择",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 7,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_6_9_008",
        name: "兴趣班体验",
        description: "可以体验一次感兴趣的兴趣班或课程",
        category: "education",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        rewardType: "experience",
        pointsRequired: 150,
        habitTags: ["学习", "体验"],
        exchangeRules: "根据孩子兴趣选择合适的体验课程",
        recommendedStock: 20,
        imageUrl: "",
        isActive: true,
        sort_order: 8,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_6_9_009",
        name: "晚睡特权",
        description: "周末可以比平时晚睡30分钟",
        category: "privilege",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        rewardType: "privilege",
        pointsRequired: 40,
        habitTags: ["特权", "时间"],
        exchangeRules: "仅限周末使用，不影响第二天活动",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 9,
        usage_count: 0,
        version: 1
      },
      {
        templateId: "reward_template_6_9_010",
        name: "成就证书",
        description: "获得一张个人成就证书，表彰优秀表现",
        category: "recognition",
        ageGroup: "primary",
        ageRange: { min: 6, max: 9 },
        rewardType: "virtual",
        pointsRequired: 30,
        habitTags: ["认可", "成就"],
        exchangeRules: "制作精美的证书，可以装裱展示",
        recommendedStock: 999,
        imageUrl: "",
        isActive: true,
        sort_order: 10,
        usage_count: 0,
        version: 1
      }
    ];

    await this.batchImportTemplates(templates, 'reward', '6-9岁奖励模板');
    this.setData({ rewardTemplates6_9Imported: true });
  },

  // 批量导入模板
  async batchImportTemplates(templates, templateType, typeName) {
    this.setData({ importing: true });
    this.addLog(`开始导入${typeName}，共${templates.length}个`, 'info');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      try {
        const result = await wx.cloud.callFunction({
          name: 'manageTemplateData',
          data: {
            action: 'create',
            templateType: templateType,
            ...template
          }
        });

        if (result.result.code === 0) {
          successCount++;
          this.addLog(`✓ ${template.name} 导入成功`, 'success');
        } else {
          failCount++;
          this.addLog(`✗ ${template.name} 导入失败: ${result.result.msg}`, 'error');
          // 输出更详细的错误信息到控制台
          console.error(`模板导入失败详情:`, {
            template: template,
            result: result.result,
            error: result.result.msg
          });
        }
      } catch (error) {
        failCount++;
        this.addLog(`✗ ${template.name} 导入失败: ${error.message}`, 'error');
      }
    }

    this.addLog(`${typeName}导入完成：成功${successCount}个，失败${failCount}个`, successCount > 0 ? 'success' : 'error');
    this.setData({ importing: false });
  },

  // 一键导入所有模板
  async importAllTemplates() {
    this.setData({ importing: true });
    this.addLog('开始一键导入所有模板...', 'info');

    try {
      await this.importTaskTemplates3_6();
      await this.importRewardTemplates3_6();
      await this.importTaskTemplates6_9();
      await this.importRewardTemplates6_9();
      
      this.addLog('所有模板导入完成！', 'success');
      wx.showToast({
        title: '导入完成',
        icon: 'success'
      });
    } catch (error) {
      this.addLog(`导入过程中出现错误: ${error.message}`, 'error');
      wx.showToast({
        title: '导入失败',
        icon: 'error'
      });
    } finally {
      this.setData({ importing: false });
    }
  }
});