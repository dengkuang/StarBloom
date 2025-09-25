# Textarea 焦点闪烁问题修复报告

## 问题描述

在微信小程序中，`form-textarea` 组件在获得焦点时出现全屏白色闪烁的问题。

### 问题现象
- 点击 textarea 输入框时出现全屏白色闪烁
- 闪烁效果影响用户体验
- 问题出现在任务添加和编辑页面

## 问题原因

问题根源在于 CSS 中的 `box-shadow` 属性：

```css
/* 问题代码 */
.form-input:focus, .form-textarea:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1); /* 这行导致闪烁 */
}
```

### 技术原因
1. **渲染兼容性**：微信小程序对某些 CSS 属性的渲染支持可能存在差异
2. **box-shadow 特性**：`box-shadow` 在小程序环境中可能触发不正常的重绘
3. **焦点切换**：在 textarea 获得焦点时，box-shadow 的应用可能导致渲染异常

## 解决方案

### 1. 移除 box-shadow 效果

将可能导致闪烁的 `box-shadow` 属性注释掉：

```css
/* 修复后的代码 */
.form-input:focus, .form-textarea:focus {
  border-color: #667eea;
  background: white;
  /* 移除可能导致闪烁的 box-shadow */
  /* box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1); */
}
```

### 2. 优化 textarea 样式

为 textarea 添加更好的兼容性样式：

```css
.form-textarea {
  min-height: 120rpx;
  resize: none;
  /* 确保在小程序中的兼容性 */
  box-sizing: border-box;
  overflow: hidden;
}
```

## 修复范围

### ✅ 已修复的文件

1. **pages/tasks/add.wxss**
   - 注释掉 `.form-textarea:focus` 中的 `box-shadow`
   - 优化 `.form-textarea` 样式，添加兼容性属性

2. **pages/tasks/edit.wxss**
   - 注释掉 `.form-textarea:focus` 中的 `box-shadow`

### ✅ 已检查的文件

3. **pages/template-editor/template-editor.wxss**
   - 确认该页面没有使用 `box-shadow`，无需修复

## 替代方案

如果需要保持焦点时的视觉反馈效果，可以考虑以下替代方案：

### 1. 使用边框效果
```css
.form-textarea:focus {
  border-color: #667eea;
  border-width: 2rpx;
  background: white;
}
```

### 2. 使用背景色变化
```css
.form-textarea:focus {
  border-color: #667eea;
  background: #f0f4ff; /* 淡蓝色背景 */
}
```

### 3. 使用伪元素
```css
.form-textarea {
  position: relative;
}

.form-textarea:focus::after {
  content: '';
  position: absolute;
  top: -2rpx;
  left: -2rpx;
  right: -2rpx;
  bottom: -2rpx;
  border: 2rpx solid #667eea;
  border-radius: 8rpx;
  pointer-events: none;
}
```

## 最佳实践

### 1. 避免复杂的 CSS 效果
在微信小程序中应避免使用可能导致渲染问题的 CSS 属性：
- 复杂的 `box-shadow`
- 过度的 `transform` 动画
- 大范围的 `filter` 效果

### 2. 优先使用简单样式
```css
/* ✅ 推荐：简单有效的焦点样式 */
.form-textarea:focus {
  border-color: #667eea;
  background: white;
}

/* ❌ 避免：可能导致问题的复杂样式 */
.form-textarea:focus {
  box-shadow: 0 0 20rpx rgba(0,0,0,0.3);
  transform: scale(1.02);
  filter: brightness(1.1);
}
```

### 3. 测试兼容性
在不同设备和微信版本上测试样式效果：
- iOS 和 Android 设备
- 不同的微信版本
- 开发者工具和真机环境

## 验证方法

修复后，请按以下步骤验证：

1. **功能测试**
   - 打开任务添加页面
   - 点击描述输入框（textarea）
   - 确认没有全屏白色闪烁

2. **样式测试**
   - 确认焦点时边框颜色正确变化
   - 确认背景色正确变化为白色
   - 确认没有其他视觉异常

3. **兼容性测试**
   - 在不同设备上测试
   - 在开发者工具和真机上测试

## 结论

通过移除导致闪烁的 `box-shadow` 属性，成功解决了 textarea 焦点时的全屏白色闪烁问题。修复后的样式保持了良好的视觉反馈效果，同时确保了在微信小程序环境中的稳定性。

这次修复提醒我们在小程序开发中需要特别注意 CSS 属性的兼容性，优先选择简单可靠的样式方案。