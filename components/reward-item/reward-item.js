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
    },
    isManageMode: {
      type: Boolean,
      value: false
    },
    currentPoints: {
      type: Number,
      value: 0
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
    onEdit: function(e) {
      console.log('点击编辑奖励按钮:', this.data.reward);
      
      if (!this.data.reward || !this.data.reward._id) {
        wx.showToast({
          title: '奖励信息错误',
          icon: 'none'
        });
        return;
      }

      // 将完整奖励数据存储到全局数据管理器
      const app = getApp();
      if (app.globalData) {
        app.globalData.editRewardData = this.data.reward;
      }
      
      wx.navigateTo({
        url: `/pages/rewards/edit?rewardId=${this.data.reward}&fromData=true`,
        success: () => {
          console.log('成功跳转到编辑奖励页面');
        },
        fail: (error) => {
          console.error('跳转到编辑奖励页面失败:', error);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
          // 如果跳转失败，回退到事件触发方式
          this.triggerEvent('edit', { 
            rewardId: this.data.reward._id,
            reward: this.data.reward 
          });
        }
      });
    },
    
    // 删除奖励
    onDelete: function(e) {
      wx.showModal({
        title: '确认删除',
        content: `确定要删除奖励"${this.data.reward.name}"吗？此操作不可恢复。`,
        confirmText: '删除',
        confirmColor: '#dc3545',
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('delete', { 
              rewardId: this.data.reward._id,
              reward: this.data.reward 
            });
          }
        }
      });
    }
  }
});