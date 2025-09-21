Component({
  properties: {
    childrenList: {
      type: Array,
      value: []
    },
    selectedChildId: {
      type: String,
      value: ''
    },
    showPoints: {
      type: Boolean,
      value: false
    }
  },

  data: {
    isExpanded: false,
    currentChild: null
  },

  observers: {
    'childrenList, selectedChildId': function(childrenList, selectedChildId) {
      this.updateCurrentChild();
    }
  },

  lifetimes: {
    attached() {
      this.updateCurrentChild();
    }
  },

  methods: {
    // 更新当前选中的孩子
    updateCurrentChild() {
      const { childrenList, selectedChildId } = this.properties;
      if (childrenList && childrenList.length > 0) {
        const currentChild = childrenList.find(child => child._id === selectedChildId) || childrenList[0];
        this.setData({
          currentChild: currentChild
        });
      }
    },

    // 切换展开/收起状态
    toggleExpanded() {
      const { childrenList } = this.properties;
      // 只有当有多个孩子时才允许展开
      if (childrenList && childrenList.length > 1) {
        this.setData({
          isExpanded: !this.data.isExpanded
        });
      }
    },

    // 选择孩子
    selectChild(e) {
      const childId = e.currentTarget.dataset.childId;
      const { childrenList } = this.properties;
      const selectedChild = childrenList.find(child => child._id === childId);
      
      if (selectedChild) {
        // 更新当前选中的孩子
        this.setData({
          currentChild: selectedChild,
          isExpanded: false
        });
        
        // 触发选择事件，通知父组件
        this.triggerEvent('childSelected', {
          child: selectedChild,
          childId: childId
        });
      }
    },

    // 编辑孩子信息
    editChild(e) {
      // catch:tap 已经自动阻止事件冒泡
      console.log("编辑孩子", e.currentTarget.dataset.childId);
      const childId = e.currentTarget.dataset.childId;
      const { childrenList } = this.properties;
      const childToEdit = childrenList.find(child => child._id === childId);
      
      if (childToEdit) {
        // 触发编辑事件，通知父组件
        this.triggerEvent('childEdit', {
          child: childToEdit,
          childId: childId
        });
      }
    },

    // 删除孩子
    deleteChild(e) {
      // catch:tap 已经自动阻止事件冒泡
      
      const childId = e.currentTarget.dataset.childId;
      const { childrenList } = this.properties;
      const childToDelete = childrenList.find(child => child._id === childId);
      
      if (childToDelete) {
        wx.showModal({
          title: '确认删除',
          content: `确定要删除孩子 "${childToDelete.name}" 吗？`,
          success: (res) => {
            if (res.confirm) {
              // 触发删除事件，通知父组件
              this.triggerEvent('childDelete', {
                child: childToDelete,
                childId: childId
              });
              
              // 如果删除的是当前选中的孩子，需要重新选择
              if (this.data.currentChild && this.data.currentChild._id === childId) {
                const remainingChildren = childrenList.filter(child => child._id !== childId);
                if (remainingChildren.length > 0) {
                  this.setData({
                    currentChild: remainingChildren[0]
                  });
                  this.triggerEvent('childSelect', {
                    child: remainingChildren[0]
                  });
                } else {
                  this.setData({
                    currentChild: null
                  });
                }
              }
            }
          }
        });
      }
    },

    // 点击遮罩层关闭
    closeMask() {
      this.setData({
        isExpanded: false
      });
    },

    // 滚动视图滚动事件（可用于后续扩展功能）
    onScrollViewScroll(e) {
      // 可以在这里添加滚动相关的逻辑
      // 比如懒加载、滚动位置记录等
    },

    // 滚动到顶部
    onScrollToUpper(e) {
      // 滚动到顶部时的处理
    },

    // 滚动到底部
    onScrollToLower(e) {
      // 滚动到底部时的处理
      // 可以用于加载更多数据
    }
  }
});