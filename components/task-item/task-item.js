// components/task-item/task-item.js
// 任务项组件逻辑
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
    }
  },
  
  data: {
  },
  
  methods: {
    // 完成任务
    onComplete: function() {
      this.triggerEvent('complete', { task: this.data.task });
    },
    
    // 编辑任务
    onEdit: function() {
      this.triggerEvent('edit', { task: this.data.task });
    },
    
    // 删除任务
    onDelete: function() {
      this.triggerEvent('delete', { task: this.data.task });
    }
  }
});