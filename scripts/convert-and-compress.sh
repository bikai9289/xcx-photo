#!/bin/bash

# 图片格式转换和压缩脚本
# 将 WebP 格式转换为 JPEG 并压缩

echo "检测到 11.jpeg 实际是 WebP 格式"
echo "正在转换为真正的 JPEG 格式并压缩..."

INPUT="/Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11.jpeg"
TEMP_PNG="/Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11_temp.png"
OUTPUT="/Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11_new.jpeg"

# 步骤1：先转换为 PNG
sips -s format png "$INPUT" --out "$TEMP_PNG"

# 步骤2：调整尺寸到 1500px（保持宽高比）
sips -Z 1500 "$TEMP_PNG"

# 步骤3：转换为 JPEG 并压缩
sips -s format jpeg -s formatOptions 85 "$TEMP_PNG" --out "$OUTPUT"

# 删除临时文件
rm "$TEMP_PNG"

echo ""
echo "转换完成！"
echo "原文件大小："
ls -lh "$INPUT" | awk '{print $5}'
echo "新文件大小："
ls -lh "$OUTPUT" | awk '{print $5}'
echo ""
echo "新文件：11_new.jpeg"
echo ""
echo "请在小程序中预览新图片，如果满意，执行以下命令替换："
echo "mv \"$OUTPUT\" \"$INPUT\""

