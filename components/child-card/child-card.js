// components/child-card/child-card.js
// 儿童卡片组件逻辑
Component({
  options: {
    addGlobalClass: true
  },
  
  properties: {
    child: {
      type: Object,
      value: {}
    },
    showActions: {
      type: Boolean,
      value: false
    }
  },
  
  data: {
  },
  
  methods: {
    // 点击儿童卡片
    onTap: function() {
      this.triggerEvent('tap', { child: this.data.child });
    },
    
    // 编辑儿童信息
    onEdit: function() {
      this.triggerEvent('edit', { child: this.data.child });
    },
    
    // 删除儿童
    onDelete: function() {
      this.triggerEvent('delete', { child: this.data.child });
    }
  }
});