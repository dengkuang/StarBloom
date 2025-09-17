// 添加孩子页面逻辑
const { childrenApi } = require('../../utils/api-services.js');
const businessDataManager = require('../../utils/businessDataManager.js');

Page({
  data: {
    formData: {
      name: '',
      gender: 'male',
      age: '',
      birthday: '',
      interests: ''
    },
    ageRange: ['3岁', '4岁', '5岁', '6岁', '7岁', '8岁', '9岁', '10岁', '11岁', '12岁', '13岁', '14岁', '15岁', '16岁', '17岁', '18岁'],
    ageIndex: 0,
    canSubmit: false,
    loading: false
  },

  onLoad: function (options) {
    this.checkCanSubmit();
  },

  // 输入框变化
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value
    });
    
    this.checkCanSubmit();
  },

  // 性别选择
  onGenderChange: function(e) {
    this.setData({
      'formData.gender': e.detail.value
    });
  },

  // 年龄选择
  onAgeChange: function(e) {
    const index = e.detail.value;
    const age = parseInt(this.data.ageRange[index]);
    
    this.setData({
      ageIndex: index,
      'formData.age': age
    });
    
    this.checkCanSubmit();
  },

  // 生日选择
  onBirthdayChange: function(e) {
    this.setData({
      'formData.birthday': e.detail.value
    });
  },

  // 检查是否可以提交
  checkCanSubmit: function() {
    const { name, age } = this.data.formData;
    const canSubmit = name.trim().length > 0 && age > 0;
    
    this.setData({ canSubmit });
  },

  // 提交表单
  onSubmit: async function(e) {
    if (this.data.loading) return;
    
    const formData = this.data.formData;
    
    // 验证必填字段
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入孩子姓名', icon: 'none' });
      return;
    }
    
    if (!formData.age) {
      wx.showToast({ title: '请选择孩子年龄', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      // 构建提交数据
      const submitData = {
        name: formData.name.trim(),
        gender: formData.gender,
        age: formData.age,
        birthday: formData.birthday,
        interests: formData.interests.trim(),
        totalPoints: 0,
        createdAt: new Date().toISOString()
      };

      // 调用API创建孩子
      const result = await childrenApi.create(submitData);
      
      if (result.code === 0) {
        const newChild = result.data;
        
        // 更新缓存的孩子列表
        await this.updateChildrenCache(newChild);
        
        wx.showToast({ 
          title: '添加成功', 
          icon: 'success',
          duration: 1500
        });
        
        // 延迟返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.msg || '添加失败');
      }
    } catch (error) {
      console.error('添加孩子失败:', error);
      wx.showToast({ 
        title: error.message || '添加失败，请重试', 
        icon: 'none' 
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 取消
  onCancel: function() {
    wx.navigateBack();
  },

  // 更新孩子缓存
  updateChildrenCache: async function(newChild) {
    try {
      // 重新获取完整的孩子列表
      const result = await childrenApi.getList();
      if (result.code === 0) {
        const updatedChildrenList = result.data || [];
        
        // 更新全局孩子列表缓存
        businessDataManager.setGlobalChildrenList(updatedChildrenList);
        
        // 如果这是第一个孩子，或者当前没有选中的孩子，则设置为当前孩子
        const currentChild = businessDataManager.getCurrentChild();
        if (!currentChild || updatedChildrenList.length === 1) {
          const newChildIndex = updatedChildrenList.findIndex(child => child._id === newChild._id);
          if (newChildIndex !== -1) {
            businessDataManager.setCurrentChild(updatedChildrenList[newChildIndex]);
            businessDataManager.setCurrentChildIndex(newChildIndex);
            
            // 通知其他页面孩子状态已更新
            businessDataManager.notifyChildChanged(updatedChildrenList[newChildIndex], newChildIndex);
          }
        }
        
        console.log('孩子缓存已更新，新增孩子:', newChild.name);
      }
    } catch (error) {
      console.error('更新孩子缓存失败:', error);
      // 即使缓存更新失败，也不影响添加成功的提示
    }
  }
});