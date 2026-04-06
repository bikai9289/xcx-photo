#!/bin/bash

# 激进压缩所有大图片，目标 < 100KB

echo "开始激进压缩..."

# 压缩 11.jpeg (131KB → 目标 < 80KB)
sips -Z 1000 /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11.jpeg
sips -s format jpeg -s formatOptions 75 /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11.jpeg --out /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11.jpeg

# 压缩 shareShow.jpg (124KB → 目标 < 80KB)
sips -Z 700 /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow.jpg
sips -s format jpeg -s formatOptions 75 /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow.jpg --out /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow.jpg

# 压缩 WechatIMG199.jpeg (78KB → 保持)
sips -Z 700 /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199.jpeg
sips -s format jpeg -s formatOptions 75 /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199.jpeg --out /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199.jpeg

echo ""
echo "压缩完成！"
echo ""
echo "新的文件大小："
ls -lh /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/pages/index/images/11.jpeg | awk '{print "11.jpeg: " $5}'
ls -lh /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/shareShow.jpg | awk '{print "shareShow.jpg: " $5}'
ls -lh /Users/bk/Desktop/bikai/xiaochengxu/photo/miniprogram/images/WechatIMG199.jpeg | awk '{print "WechatIMG199.jpeg: " $5}'

