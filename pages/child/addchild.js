// 添加孩子页面逻辑
const { childrenApi } = require('../../utils/api-services.js');
const businessDataManager = require('../../utils/businessDataManager.js');
const { globalChildManager } = require('../../utils/global-child-manager.js');

Page({
  data: {
    formData: {
      name: '',
      gender: 'male',
      age: '',
      birthday: '',
      interests: '',
      avatar: '/images/3dboy1.png' // 默认头像
    },
    canSubmit: false,
    loading: false,
    uploadedAvatarPath: '', // 上传的头像路径
    isCustomAvatar: false, // 是否使用自定义头像
    // 可选头像列表
    avatarList: [
      { path: '/images/3dboy1.png', name: '3D男孩1', gender: 'male' },
      { path: '/images/3dboy2.png', name: '3D男孩2', gender: 'male' },
      { path: '/images/cartoonboy1.png', name: '卡通男孩1', gender: 'male' },
      { path: '/images/cartoonboy2.png', name: '卡通男孩2', gender: 'male' },
      { path: '/images/cartoongirl1.png', name: '卡通女孩1', gender: 'female' },
      { path: '/images/cartoongirl2.png', name: '卡通女孩2', gender: 'female' },
      { path: '/images/cartoongir.png', name: '卡通女孩3', gender: 'female' },
      { path: '/images/cartoongir3.png', name: '卡通女孩4', gender: 'female' },
    ]
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
    const gender = e.detail.value;
    this.setData({
      'formData.gender': gender
    });
    
    // 根据性别自动推荐头像
    this.recommendAvatarByGender(gender);
  },

  // 根据性别推荐头像
  recommendAvatarByGender: function(gender) {
    const currentAvatar = this.data.formData.avatar;
    const avatarList = this.data.avatarList;
    
    // 如果当前头像已经匹配性别，不需要更改
    const currentAvatarInfo = avatarList.find(item => item.path === currentAvatar);
    if (currentAvatarInfo && (currentAvatarInfo.gender === gender || currentAvatarInfo.gender === 'both')) {
      return;
    }
    
    // 找到匹配性别的第一个头像
    const recommendedAvatar = avatarList.find(item => item.gender === gender);
    if (recommendedAvatar) {
      this.setData({
        'formData.avatar': recommendedAvatar.path
      });
      
      wx.showToast({
        title: `已为您推荐${gender === 'male' ? '男孩' : '女孩'}头像`,
        icon: 'none',
        duration: 1500
      });
    }
  },

  // 头像选择
  onAvatarSelect: function(e) {
    const avatar = e.currentTarget.dataset.avatar;
    this.setData({
      'formData.avatar': avatar,
      isCustomAvatar: false // 选择预设头像时标记为非自定义
    });
    
    wx.showToast({
      title: '头像已选择',
      icon: 'success',
      duration: 1000
    });
  },

  // 上传自定义头像
  onUploadAvatar: function() {
    const that = this;
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success: function(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        // 显示加载提示
        wx.showLoading({
          title: '上传中...',
          mask: true
        });
        
        // 上传到云存储
        that.uploadToCloud(tempFilePath);
      },
      fail: function(err) {
        console.error('选择图片失败:', err);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 上传到云存储
  uploadToCloud: function(tempFilePath) {
    const that = this;
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const fileName = `avatars/child_avatar_${timestamp}_${random}.jpg`;
    
    wx.cloud.uploadFile({
      cloudPath: fileName,
      filePath: tempFilePath,
      success: function(res) {
        console.log('上传成功:', res);
        
        // 更新头像路径
        that.setData({
          'formData.avatar': res.fileID,
          uploadedAvatarPath: res.fileID,
          isCustomAvatar: true
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '头像上传成功',
          icon: 'success',
          duration: 1500
        });
      },
      fail: function(err) {
        console.error('上传失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 生日选择
  onBirthdayChange: function(e) {
    const birthday = e.detail.value;
    this.setData({
      'formData.birthday': birthday
    });
    
    // 根据生日自动计算年龄
    if (birthday) {
      const age = this.calculateAge(birthday);
      this.setData({
        'formData.age': age
      });
    }
    
    this.checkCanSubmit();
  },

  // 计算年龄
  calculateAge: function(birthday) {
    if (!birthday) return '';
    
    const birthDate = new Date(birthday);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // 如果还没到生日，年龄减1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // 确保年龄在合理范围内
    if (age < 0) age = 0;
    if (age > 18) age = 18;
    
    return age;
  },

  // 检查是否可以提交
  checkCanSubmit: function() {
    const { name, birthday } = this.data.formData;
    const canSubmit = name.trim().length > 0 && birthday.length > 0;
    
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
    
    if (!formData.birthday) {
      wx.showToast({ title: '请选择孩子生日', icon: 'none' });
      return;
    }
    
    // 确保年龄已计算
    if (!formData.age && formData.age !== 0) {
      const age = this.calculateAge(formData.birthday);
      this.setData({
        'formData.age': age
      });
      formData.age = age;
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
        avatar: formData.avatar || '/images/default-avatar.png', // 确保有默认头像
        isCustomAvatar: this.data.isCustomAvatar, // 标记是否为自定义头像
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
        businessDataManager.setChildrenList(updatedChildrenList);
        
        // 如果这是第一个孩子，或者当前没有选中的孩子，则设置为当前孩子
        const currentChild = businessDataManager.getCurrentChild();
        if (!currentChild || updatedChildrenList.length === 1) {
          const newChildIndex = updatedChildrenList.findIndex(child => child._id === newChild._id);
          if (newChildIndex !== -1) {
            // 使用全局状态管理器切换到新添加的孩子
            globalChildManager.switchChild(updatedChildrenList, newChildIndex);
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