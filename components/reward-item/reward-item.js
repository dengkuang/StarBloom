// components/reward-item/reward-item.js
// 奖励项组件逻辑
Component({
  options: {
    addGlobalClass: true
  },
  
  properties: {
    reward: {
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
    // 兑换奖励
    onExchange: function() {
      this.triggerEvent('exchange', { reward: this.data.reward });
    },
    
    // 编辑奖励
    onEdit: function() {
      this.triggerEvent('edit', { reward: this.data.reward });
    },
    
    // 删除奖励
    onDelete: function() {
      this.triggerEvent('delete', { reward: this.data.reward });
    }
  }
});