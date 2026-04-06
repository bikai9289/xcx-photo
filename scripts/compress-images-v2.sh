#!/bin/bash

# 图片压缩脚本 - 改进版
# 使用 sips 调整尺寸和质量来压缩图片

echo "开始压缩图片..."

INPUT="/Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11.jpeg"
OUTPUT="/Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11_compressed.jpeg"

# 获取原始尺寸
echo "原始文件大小："
ls -lh "$INPUT" | awk '{print $5}'

# 方法1：降低质量到 60%
sips -s format jpeg -s formatOptions 60 "$INPUT" --out "$OUTPUT"

echo ""
echo "压缩后文件大小："
ls -lh "$OUTPUT" | awk '{print $5}'

echo ""
echo "压缩完成！"
echo "原文件：11.jpeg"
echo "压缩后：11_compressed.jpeg"
echo ""
echo "如果文件还是太大，可以尝试调整尺寸："
echo "sips -Z 800 \"$OUTPUT\""
echo ""
echo "如果满意，执行以下命令替换："
echo "mv \"$OUTPUT\" \"$INPUT\""

