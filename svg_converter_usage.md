# SVG转PNG转换器使用说明

## 脚本版本

提供了两个版本的转换器：

1. **完整版本** (`svg_to_png_converter.py`) - 需要安装Python库
2. **简化版本** (`svg_to_png_simple.py`) - 无需额外依赖，推荐使用

## 推荐使用简化版本

### 1. 转换当前项目的SVG图标（HTML方法）
```bash
python3 svg_to_png_simple.py --wechat -m html
```

### 2. 如果安装了Inkscape
```bash
python3 svg_to_png_simple.py --wechat -m inkscape
```

### 3. 自定义输入输出目录
```bash
python3 svg_to_png_simple.py -i images -o output --wechat -m html
```

### 4. 自定义图标尺寸
```bash
python3 svg_to_png_simple.py --wechat -s 128 -m html
```

## 参数说明

- `-i, --input`: 输入目录（默认: images）
- `-o, --output`: 输出目录（默认: images-png）
- `-s, --size`: 图标尺寸（默认: 81）
- `-m, --method`: 转换方法 (auto, inkscape, online, html)
- `--wechat`: 使用微信小程序图标转换模式

## 转换方法说明

1. **html方法**（推荐）：创建HTML文件，在浏览器中打开进行转换
2. **inkscape方法**：需要安装Inkscape软件，批量转换
3. **auto方法**：自动选择最佳转换方法

## 使用HTML转换器

1. 运行命令：
```bash
cd /mnt/d/CODE/AIPro/xiaogame/StarBloom
python3 svg_to_png_simple.py --wechat -m html
```

2. 在浏览器中打开 `images-png/svg_converter.html`

3. 点击每个图标的"转换为PNG"按钮

4. 点击"下载PNG"按钮保存文件，或右键图片另存为

## 完整版本（可选）

如果需要使用完整版本，请先安装依赖：

```bash
pip install -r requirements.txt
```

然后使用：
```bash
python svg_to_png_converter.py --wechat
```

## 示例

为StarBloom项目转换图标（推荐）：
```bash
cd /mnt/d/CODE/AIPro/xiaogame/StarBloom
python3 svg_to_png_simple.py --wechat -m html
```

转换后的PNG文件将保存在 `images-png` 目录中。

## 注意事项

- HTML方法需要手动操作，但无需安装额外软件
- Inkscape方法需要安装Inkscape：`sudo apt install inkscape` (Ubuntu) 或从官网下载
- 转换后的PNG文件保持透明背景
- 微信小程序推荐使用81x81像素的图标