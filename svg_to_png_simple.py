#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SVG转PNG转换脚本 - 简化版本
使用svglib和reportlab进行转换，或使用在线转换API
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path
import urllib.request
import urllib.parse
import json


def check_inkscape():
    """检查是否安装了Inkscape"""
    try:
        subprocess.run(['inkscape', '--version'], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def convert_with_inkscape(svg_path, png_path, size=None):
    """使用Inkscape转换SVG到PNG"""
    try:
        cmd = ['inkscape', svg_path, '--export-png=' + png_path]
        if size:
            cmd.extend(['-w', str(size), '-h', str(size)])
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"✓ {svg_path} → {png_path} (Inkscape)")
        return True
    except Exception as e:
        print(f"✗ Inkscape转换失败 {svg_path}: {str(e)}")
        return False


def convert_with_online_api(svg_path, png_path, size=None):
    """使用在线API转换SVG到PNG"""
    try:
        # 读取SVG文件
        with open(svg_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        # 构建API请求
        api_url = "https://api.cloudconvert.com/v2/convert"
        
        # 这里使用一个免费的转换服务
        # 注意：实际使用时可能需要API密钥
        params = {
            'inputformat': 'svg',
            'outputformat': 'png',
            'input': 'base64',
            'file': svg_content.encode('utf-8').hex(),
            'filename': os.path.basename(svg_path)
        }
        
        if size:
            params['options[w]'] = size
            params['options[h]'] = size
        
        # 构建URL
        full_url = api_url + '?' + urllib.parse.urlencode(params)
        
        # 发送请求
        with urllib.request.urlopen(full_url) as response:
            result = json.loads(response.read().decode())
            
        if 'data' in result and 'url' in result['data']:
            # 下载转换后的文件
            urllib.request.urlretrieve(result['data']['url'], png_path)
            print(f"✓ {svg_path} → {png_path} (Online API)")
            return True
        else:
            print(f"✗ API转换失败 {svg_path}")
            return False
            
    except Exception as e:
        print(f"✗ 在线API转换失败 {svg_path}: {str(e)}")
        return False


def create_html_converter(svg_files, output_dir, size=None):
    """创建HTML文件用于浏览器转换"""
    html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>SVG转PNG转换器</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .converter { margin: 20px 0; }
        .svg-item { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
        canvas { border: 1px solid #ddd; margin: 10px 0; }
        button { padding: 10px 20px; margin: 5px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <h1>🎨 SVG转PNG转换器</h1>
    <div class="converter">
"""

    for i, svg_file in enumerate(svg_files):
        with open(svg_file, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        html_content += f"""
        <div class="svg-item">
            <h3>{os.path.basename(svg_file)}</h3>
            <div id="svg-{i}" style="display: none;">{svg_content}</div>
            <canvas id="canvas-{i}" width="{size or 200}" height="{size or 200}"></canvas>
            <button onclick="convertToPNG({i}, '{os.path.basename(svg_file).replace('.svg', '.png')}')">转换为PNG</button>
            <button onclick="downloadPNG({i}, '{os.path.basename(svg_file).replace('.svg', '.png')}')">下载PNG</button>
        </div>
"""

    html_content += """
    </div>

    <script>
        function convertToPNG(index, filename) {
            const svgElement = document.getElementById(`svg-${index}`);
            const canvas = document.getElementById(`canvas-${index}`);
            const ctx = canvas.getContext('2d');
            
            const svgData = new XMLSerializer().serializeToString(svgElement.firstChild);
            const img = new Image();
            
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }
        
        function downloadPNG(index, filename) {
            const canvas = document.getElementById(`canvas-${index}`);
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL();
            link.click();
        }
    </script>
</body>
</html>
"""

    html_path = os.path.join(output_dir, 'svg_converter.html')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✓ HTML转换器已创建: {html_path}")
    print(f"✓ 在浏览器中打开此文件，点击按钮即可转换和下载PNG文件")


def batch_convert_svg_to_png(input_dir, output_dir, size=None, method='auto'):
    """
    批量转换SVG文件为PNG格式
    
    Args:
        input_dir (str): 输入目录
        output_dir (str): 输出目录
        size (int): 目标尺寸
        method (str): 转换方法 (auto, inkscape, online, html)
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    # 创建输出目录
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 查找所有SVG文件
    svg_files = list(input_path.glob('*.svg'))
    
    if not svg_files:
        print(f"在 {input_dir} 中未找到SVG文件")
        return
    
    print(f"找到 {len(svg_files)} 个SVG文件")
    
    if method == 'html':
        create_html_converter(svg_files, output_dir, size)
        return
    
    success_count = 0
    total_count = len(svg_files)
    
    # 选择转换方法
    if method == 'auto':
        if check_inkscape():
            method = 'inkscape'
            print("使用Inkscape进行转换")
        else:
            method = 'html'
            print("未找到Inkscape，创建HTML转换器")
            create_html_converter(svg_files, output_dir, size)
            return
    
    for svg_file in svg_files:
        png_filename = svg_file.stem + '.png'
        png_path = output_path / png_filename
        
        # 执行转换
        if method == 'inkscape':
            if convert_with_inkscape(str(svg_file), str(png_path), size):
                success_count += 1
        elif method == 'online':
            if convert_with_online_api(str(svg_file), str(png_path), size):
                success_count += 1
    
    if method != 'html':
        print(f"\n转换完成：{success_count}/{total_count} 个文件转换成功")


def main():
    parser = argparse.ArgumentParser(description='SVG转PNG转换工具 - 简化版本')
    parser.add_argument('-i', '--input', default='images', help='输入目录 (默认: images)')
    parser.add_argument('-o', '--output', default='images-png', help='输出目录 (默认: images-png)')
    parser.add_argument('-s', '--size', type=int, default=81, help='图标尺寸 (默认: 81)')
    parser.add_argument('-m', '--method', choices=['auto', 'inkscape', 'online', 'html'], 
                       default='auto', help='转换方法 (默认: auto)')
    parser.add_argument('--wechat', action='store_true', help='使用微信小程序图标转换模式')
    
    args = parser.parse_args()
    
    try:
        print("🎨 SVG转PNG转换器 - 简化版本")
        print("=" * 50)
        
        if args.wechat:
            print("📱 微信小程序图标模式")
            args.size = 81
        
        print(f"📁 输入目录: {args.input}")
        print(f"📁 输出目录: {args.output}")
        print(f"📏 图标尺寸: {args.size}x{args.size}")
        print(f"🔧 转换方法: {args.method}")
        print()
        
        batch_convert_svg_to_png(
            input_dir=args.input,
            output_dir=args.output,
            size=args.size,
            method=args.method
        )
        
        if args.method == 'html':
            print(f"\n✅ 请在浏览器中打开: {args.output}/svg_converter.html")
            print("📋 点击转换按钮，然后右键保存图片即可")
        else:
            print(f"\n✅ 转换完成，文件保存在: {args.output}")
            
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()