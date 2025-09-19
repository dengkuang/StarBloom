#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SVG转PNG转换脚本
将项目中的SVG图标文件批量转换为PNG格式
"""

import os
import sys
import argparse
from pathlib import Path
import cairosvg
from PIL import Image
import io


def svg_to_png(svg_path, png_path, size=None, background_color=None):
    """
    将SVG文件转换为PNG格式
    
    Args:
        svg_path (str): SVG文件路径
        png_path (str): 输出PNG文件路径
        size (tuple): 目标尺寸 (width, height)，默认保持原始尺寸
        background_color (str): 背景颜色，默认透明
    """
    try:
        # 读取SVG文件
        with open(svg_path, 'rb') as f:
            svg_data = f.read()
        
        # 转换选项
        options = {
            'format': 'png',
            'output_width': size[0] if size else None,
            'output_height': size[1] if size else None,
        }
        
        if background_color:
            options['background_color'] = background_color
        
        # 执行转换
        png_data = cairosvg.svg2png(bytestring=svg_data, **options)
        
        # 保存PNG文件
        with open(png_path, 'wb') as f:
            f.write(png_data)
        
        print(f"✓ {svg_path} → {png_path}")
        return True
        
    except Exception as e:
        print(f"✗ 转换失败 {svg_path}: {str(e)}")
        return False


def batch_convert_svg_to_png(input_dir, output_dir, size=None, background_color=None):
    """
    批量转换SVG文件为PNG格式
    
    Args:
        input_dir (str): 输入目录
        output_dir (str): 输出目录
        size (tuple): 目标尺寸 (width, height)
        background_color (str): 背景颜色
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
    
    print(f"找到 {len(svg_files)} 个SVG文件，开始转换...")
    
    success_count = 0
    total_count = len(svg_files)
    
    for svg_file in svg_files:
        # 生成输出文件名
        png_filename = svg_file.stem + '.png'
        png_path = output_path / png_filename
        
        # 转换单个文件
        if svg_to_png(str(svg_file), str(png_path), size, background_color):
            success_count += 1
    
    print(f"\n转换完成：{success_count}/{total_count} 个文件转换成功")


def convert_wechat_icons(input_dir='images', output_dir='images-png', size=81):
    """
    转换微信小程序图标（专门为StarBloom项目）
    
    Args:
        input_dir (str): 输入目录，默认为images
        output_dir (str): 输出目录，默认为images-png
        size (int): 图标尺寸，默认为81x81像素
    """
    print("🎨 StarBloom 微信小程序图标转换器")
    print("=" * 50)
    
    # 设置转换参数
    target_size = (size, size)  # 微信小程序图标通常为81x81
    
    # 转换SVG到PNG
    batch_convert_svg_to_png(
        input_dir=input_dir,
        output_dir=output_dir,
        size=target_size,
        background_color=None  # 保持透明背景
    )
    
    print(f"\n✅ 图标已转换并保存到: {output_dir}")
    print(f"📏 图标尺寸: {size}x{size} 像素")
    print(f"🎯 背景颜色: 透明")


def main():
    parser = argparse.ArgumentParser(description='SVG转PNG转换工具')
    parser.add_argument('-i', '--input', default='images', help='输入目录 (默认: images)')
    parser.add_argument('-o', '--output', default='images-png', help='输出目录 (默认: images-png)')
    parser.add_argument('-s', '--size', type=int, default=81, help='图标尺寸 (默认: 81)')
    parser.add_argument('-b', '--background', help='背景颜色 (例如: white, #FFFFFF)')
    parser.add_argument('--wechat', action='store_true', help='使用微信小程序图标转换模式')
    
    args = parser.parse_args()
    
    try:
        if args.wechat:
            convert_wechat_icons(args.input, args.output, args.size)
        else:
            batch_convert_svg_to_png(
                input_dir=args.input,
                output_dir=args.output,
                size=(args.size, args.size) if args.size else None,
                background_color=args.background
            )
    except Exception as e:
        print(f"❌ 错误: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()