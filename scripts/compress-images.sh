#!/bin/bash

# 图片压缩脚本
# 使用 macOS 自带的 sips 工具压缩图片

echo "开始压缩图片..."

# 压缩 11.jpeg
sips -s format jpeg -s formatOptions 80 /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11.jpeg --out /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11_compressed.jpeg

echo "压缩完成！"
echo "原文件：11.jpeg"
echo "压缩后：11_compressed.jpeg"
echo ""
echo "请检查压缩后的图片质量，如果满意，执行以下命令替换："
echo "mv /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11_compressed.jpeg /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11.jpeg"

