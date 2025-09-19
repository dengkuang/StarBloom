// 孩子选择器组件
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 孩子列表
    childrenList: {
      type: Array,
      value: []
    },
    // 当前选中的孩子
    currentChild: {
      type: Object,
      value: null
    },
    // 当前选中的索引
    selectedIndex: {
      type: Number,
      value: 0
    },
    // 是否显示积分
    showPoints: {
      type: Boolean,
      value: true
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    },
    // 占位符文本
    placeholder: {
      type: String,
      value: '请选择孩子'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showList: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 切换选择器显示状态
     */
    toggleSelector() {
      if (this.data.disabled) return;
      
      // 如果只有一个孩子，不显示列表
      if (this.data.childrenList.length <= 1) {
        wx.showToast({
          title: '只有一个孩子',
          icon: 'none',
          duration: 1500
        });
        return;
      }

      this.setData({
        showList: !this.data.showList
      });

      // 触发展开/收起事件
      this.triggerEvent('toggle', {
        show: this.data.showList
      });
    },

    /**
     * 隐藏选择器
     */
    hideSelector() {
      this.setData({
        showList: false
      });

      this.triggerEvent('toggle', {
        show: false
      });
    },

    /**
     * 选择孩子
     */
    onSelectChild(e) {
      const index = parseInt(e.currentTarget.dataset.index);
      const childrenList = this.data.childrenList;
      
      if (index < 0 || index >= childrenList.length) {
        console.error('Invalid child index:', index);
        return;
      }

      const selectedChild = childrenList[index];
      
      // 如果选择的是当前孩子，只收起列表
      if (index === this.data.selectedIndex) {
        this.hideSelector();
        return;
      }

      // 更新选中状态
      this.setData({
        selectedIndex: index,
        showList: false
      });

      // 触发选择事件
      this.triggerEvent('change', {
        index: index,
        child: selectedChild,
        childrenList: childrenList
      });

      // 显示选择提示
      wx.showToast({
        title: `已选择 ${selectedChild.name}`,
        icon: 'success',
        duration: 1000
      });
    },

    /**
     * 外部调用：设置当前选中的孩子
     */
    setCurrentChild(child, index) {
      this.setData({
        currentChild: child,
        selectedIndex: index || 0
      });
    },

    /**
     * 外部调用：更新孩子列表
     */
    updateChildrenList(childrenList) {
      this.setData({
        childrenList: childrenList
      });
    },

    /**
     * 外部调用：重置选择器
     */
    reset() {
      this.setData({
        showList: false,
        selectedIndex: 0,
        currentChild: null
      });
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 组件实例被放入页面节点树后执行
      console.log('ChildSelector attached');
    },

    detached() {
      // 组件实例被从页面节点树移除后执行
      console.log('ChildSelector detached');
    }
  },

  /**
   * 组件所在页面的生命周期
   */
  pageLifetimes: {
    show() {
      // 页面被展示时执行
    },

    hide() {
      // 页面被隐藏时执行
      this.hideSelector();
    }
  },

  /**
   * 数据监听器
   */
  observers: {
    'childrenList, selectedIndex': function(childrenList, selectedIndex) {
      // 当孩子列表或选中索引变化时，更新当前孩子
      if (childrenList && childrenList.length > 0 && selectedIndex >= 0 && selectedIndex < childrenList.length) {
        this.setData({
          currentChild: childrenList[selectedIndex]
        });
      }
    }
  }
});