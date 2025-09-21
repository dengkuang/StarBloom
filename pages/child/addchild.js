// 添加孩子页面逻辑
const { childrenApi } = require('../../utils/api-services.js');
const businessDataManager = require('../../utils/businessDataManager.js');
const { globalChildManager } = require('../../utils/global-child-manager.js');

Page({
  data: {
    // 页面模式：add 添加，edit 编辑
    mode: 'add',
    child: null, // 编辑时的孩子
    formData: {
      name: '',
      gender: 'male',
      age: '',
      birthday: '',
      interests: '',
      avatar: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAECWsNoz0ISQJY93IjtKn5YZFCBgLI6HgACPDoAAtUHeVaHEDnW8fXukTYE.png' // 默认头像
    },
    canSubmit: false,
    loading: false,
    uploadedAvatarPath: '', // 上传的头像路径
    isCustomAvatar: false, // 是否使用自定义头像
    // 可选头像列表
    avatarList: [
      { path: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAECWsNoz0ISQJY93IjtKn5YZFCBgLI6HgACPDoAAtUHeVaHEDnW8fXukTYE.png', name: '3D男孩1', gender: 'male' },
      { path: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAECWtloz0JJkyXSycO7adKCqaYBPxhWWgACUjoAAtUHeVbQ7ngsMrfttTYE.png', name: '3D男孩2', gender: 'male' },
      { path: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAECWtVoz0JGhK-BlhKQ1bvO9i9fODmRIwACTjoAAtUHeVYiCCa2UZ3SIzYE.png', name: '卡通男孩1', gender: 'male' },
      { path: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAECWtRoz0JFcVd7ytbmLHHLxZp3JMQwMwACTToAAtUHeVY2OjtHAqWPTTYE.png', name: '卡通男孩2', gender: 'male' },
      { path: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAECWtZoz0JGGZpzs5OaRCc6mItV1bgibgACTzoAAtUHeVYlPtiBwIGE-DYE.png', name: '卡通女孩1', gender: 'female' },
      { path: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAECWtNoz0JE6vroWvUUaZvbm8FbzndoNwACTDoAAtUHeVZx8nO1e6EGKzYE.png', name: '卡通女孩2', gender: 'female' },
      { path: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAECWttoz0JPPeTO9cdA0dt6UY9uC1Q7NAACVDoAAtUHeVZfs1XWknYBLjYE.png', name: '卡通女孩3', gender: 'female' },
      { path: 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAECWtdoz0JJ8A-WdszJ54wJUmKMHth0ygACUDoAAtUHeVZDYOc8Tw8OnjYE.png', name: '卡通女孩4', gender: 'female' },
    ]
  },

  onLoad: function (options) {
    // 检查是否为编辑模式
    console.log('onLoad参数:', options);
    
    // 支持多种参数格式：childId、action=edit&childId=xxx、child对象
    const childId = options.childId || (options.action === 'edit' ? options.childId : null);
    let child = options.child;
    
    // 处理可能被字符串化的child对象
    if (child && typeof child === 'string') {
      try {
        // 如果child是字符串，尝试解析为JSON
        if (child == '[object Object]') {
          child = JSON.parse(child);
        } else {
          // 如果是'[object Object]'字符串，说明对象传递有问题，使用childId方式
          child = null;
        }
      } catch (error) {
        console.warn('解析child对象失败:', error);
        child = null;
      }
    }
    
    if (childId) {
      // 通过childId加载孩子数据
      this.loadChildData(childId);
    } else if (child && typeof child === 'object') {
      // 直接使用传入的child对象
      this.setData({
        mode: 'edit',
        child: child,
        formData: {
          name: child.name || '',
          gender: child.gender || 'male',
          age: child.age || '',
          birthday: child.birthday || '',
          interests: child.interests || '',
          avatar: child.avatar || this.data.formData.avatar
        }
      });
      this.checkCanSubmit();
    } else {
      // 添加模式
      this.setData({
        mode: 'add'
      });
      this.checkCanSubmit();
    }
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

  // 根据childId加载孩子数据
  loadChildData: async function(childId) {
    if (!childId) {
      console.error('loadChildData: childId为空');
      return;
    }

    try {
      this.setData({ loading: true });
      
      // 先尝试从缓存获取孩子列表
      let childrenList = businessDataManager.getChildrenList();
      
      // 如果缓存中没有，则从API获取
      if (!childrenList || childrenList.length === 0) {
        const result = await childrenApi.getList();
        if (result.success) {
          childrenList = result.data;
          businessDataManager.setChildrenList(childrenList);
        } else {
          throw new Error(result.message || '获取孩子列表失败');
        }
      }
      
      // 在孩子列表中查找对应的孩子
      const childData = childrenList.find(child => child._id === childId);
      
      if (childData) {
        console.log('加载到的孩子数据:', childData);
        this.setData({
          mode: 'edit',
          child: childData,
          formData:childData
        });
        this.checkCanSubmit();
      } else {
        wx.showToast({
          title: '未找到孩子信息',
          icon: 'error'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('加载孩子数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
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
    const formData = this.data.formData || {};
    console.log('检查提交条件:', formData);
    const { name = '', birthday = '' } = formData;
    const canSubmit = Boolean((name && name.length > 0) && (birthday && birthday.length > 0));
    
    this.setData({ canSubmit });
  },

  // 提交表单
  onSubmit: async function(e) {
    if (this.data.loading) return;
    
    const formData = this.data.formData;
    const isEditMode = this.data.mode === 'edit';
    
    // 验证必填字段
    if (!formData.name ) {
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
      const submitData = formData;

      let result;
      if (isEditMode) {
        // 编辑模式：更新孩子信息
        submitData.updatedAt = new Date().toISOString();
        result = await childrenApi.update(this.data.childId, submitData);
      } else {
        // 添加模式：创建新孩子
        submitData.totalPoints = 0;
        submitData.createdAt = new Date().toISOString();
        result = await childrenApi.create(submitData);
      }
      
      if (result.code === 0) {
      
        
        // 更新缓存的孩子列表
        await this.updateChildrenCache(submitData, isEditMode);
        
        wx.showToast({ 
          title: isEditMode ? '更新成功' : '添加成功', 
          icon: 'success',
          duration: 1500
        });
        
        // 延迟返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.msg || (isEditMode ? '更新失败' : '添加失败'));
      }
    } catch (error) {
      console.error(`${isEditMode ? '更新' : '添加'}孩子失败:`, error);
      wx.showToast({ 
        title: error.message || `${isEditMode ? '更新' : '添加'}失败，请重试`, 
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
  updateChildrenCache: async function(childData, isEditMode = false) {
    console.log('更新孩子缓存:', childData, isEditMode);
    try {
      // 重新获取完整的孩子列表
      const result = await childrenApi.getList();
      if (result.code === 0) {
        const updatedChildrenList = result.data || [];
        
        // 更新全局孩子列表缓存
        businessDataManager.setChildrenList(updatedChildrenList);
        
        if (isEditMode) {
          // 编辑模式：更新当前选中的孩子信息
          const currentChild = businessDataManager.getCurrentChild();
          if (currentChild && currentChild._id === childData._id) {
            // 如果编辑的是当前选中的孩子，更新当前孩子信息
            const updatedChildIndex = updatedChildrenList.findIndex(child => child._id === childData._id);
            if (updatedChildIndex !== -1) {
              globalChildManager.switchChild(updatedChildrenList, updatedChildIndex);
            }
          }
          console.log('孩子缓存已更新，编辑孩子:', childData.name);
        } else {
          // 添加模式：如果这是第一个孩子，或者当前没有选中的孩子，则设置为当前孩子
          const currentChild = businessDataManager.getCurrentChild();
          if (!currentChild || updatedChildrenList.length === 1) {
            const newChildIndex = updatedChildrenList.findIndex(child => child._id === childData._id);
            if (newChildIndex !== -1) {
              // 使用全局状态管理器切换到新添加的孩子
              globalChildManager.switchChild(updatedChildrenList, newChildIndex);
            }
          }
          console.log('孩子缓存已更新，新增孩子:', childData.name);
        }
      }
    } catch (error) {
      console.error('更新孩子缓存失败:', error);
      // 即使缓存更新失败，也不影响操作成功的提示
    }
  }
});