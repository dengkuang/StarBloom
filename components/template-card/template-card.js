// components/template-card/template-card.js
// 模板卡片组件逻辑
Component({
  options: {
    addGlobalClass: true
  },
  
  properties: {
    template: {
      type: Object,
      value: {}
    },
    type: {
      type: String,
      value: 'task' // task or reward
    }
  },
  
  data: {
  },
  
  methods: {
    // 应用模板
    onApply: function() {
      this.triggerEvent('apply', { template: this.data.template });
    },
    
    // 预览模板
    onPreview: function() {
      this.triggerEvent('preview', { template: this.data.template });
    },
    
    // 编辑模板
    onEdit: function() {
      this.triggerEvent('edit', { template: this.data.template });
    }
  }
});