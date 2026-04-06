#!/bin/bash

# 压缩 shareShow.jpg 和 WechatIMG199.jpeg

echo "开始压缩图片..."

# 压缩 shareShow.jpg (148KB → 目标 < 100KB)
sips -s format png /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow.jpg --out /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow_temp.png
sips -Z 800 /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow_temp.png
sips -s format jpeg -s formatOptions 85 /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow_temp.png --out /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow_new.jpg
rm /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow_temp.png

# 压缩 WechatIMG199.jpeg (181KB → 目标 < 100KB)
sips -s format png /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199.jpeg --out /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199_temp.png
sips -Z 800 /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199_temp.png
sips -s format jpeg -s formatOptions 85 /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199_temp.png --out /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199_new.jpeg
rm /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199_temp.png

echo ""
echo "压缩完成！"
echo ""
echo "shareShow.jpg:"
echo "  原始: $(ls -lh /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow.jpg | awk '{print $5}')"
echo "  压缩: $(ls -lh /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow_new.jpg | awk '{print $5}')"
echo ""
echo "WechatIMG199.jpeg:"
echo "  原始: $(ls -lh /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199.jpeg | awk '{print $5}')"
echo "  压缩: $(ls -lh /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199_new.jpeg | awk '{print $5}')"
echo ""
echo "如果满意，执行以下命令替换："
echo "mv /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow_new.jpg /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow.jpg"
echo "mv /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199_new.jpeg /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199.jpeg"

