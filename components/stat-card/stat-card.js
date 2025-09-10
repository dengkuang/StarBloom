// components/stat-card/stat-card.js
// 统计卡片组件逻辑
Component({
  options: {
    addGlobalClass: true
  },
  
  properties: {
    title: {
      type: String,
      value: ''
    },
    value: {
      type: Number,
      value: 0
    },
    unit: {
      type: String,
      value: ''
    },
    icon: {
      type: String,
      value: ''
    }
  },
  
  data: {
  },
  
  methods: {
  }
});