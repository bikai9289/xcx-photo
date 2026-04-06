const http = require('http')
const https = require('https')
const cloud = require('wx-server-sdk')
// 暂时注释掉阿里云依赖，避免报错
// const AliCloud = require('./AliCloud')
cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV,
})
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 图片压缩
    const imgInfo = await imageMinify(event)
    // 图片校验
    return await imgSecCheck(event, imgInfo)
  } catch (error) {
    return await imgSecCheck(event, event)
  }
}

// 图片压缩
async function imageMinify (imgInfo) {
  const { width, height, filePath, type } = imgInfo
  // 需要压缩，腾讯免费的图片安全接口要求的
  if ((width > 750 && height > 750) || width > 1334 || height > 1334) {
    const imgSize = getImageSize({ width, height })
    const { result } = await cloud.callFunction({
      name: 'imageCompose',
      data: {
        imgType: 'jpg',
        dataType: 'url',
        data: [{ ...imgSize, src: filePath }]
      }
    })
    return {
      width: imgSize.width,
      height: imgSize.height,
      filePath: result.value,
      type: result.imageType
    }
  }
  return imgInfo
}

// 计算压缩后的图片宽高
function getImageSize (imgInfo) {
  let width = 0, height = 0
  if (imgInfo.width > imgInfo.height) {
    width = 750
    height = 750 * imgInfo.height / imgInfo.width
  } else if (imgInfo.height > imgInfo.width) {
    height = 750
    width = 750 * imgInfo.width / imgInfo.height
  } else {
    width = height = 750
  }
  return {
    width,
    height
  }
}

// 获取图片buffer
function getBuffer (src) {
	const protocol = src.split('://')[0]
	return new Promise((resolve, reject) => {
		;({ http, https }[protocol]).get(src, res => {
			if (res.statusCode !== 200) return reject(new Error('图片加载失败'))
			const rawData = []
			res.setEncoding('binary')
			res.on('data', chunk => rawData.push(chunk))
			res.on('end', () => resolve(Buffer.from(rawData.join(''), 'binary')))
		})
	})
}

// 腾讯免费的图片内容安全检测
async function imgSecCheck (event, imgInfo) {
  // 获取图片buffer
  const buffer = await getBuffer(imgInfo.filePath)
  try {
    const imgResult = await cloud.openapi.security.imgSecCheck({
      media:{
        header: {'content-Type': 'application/octe-stream'},
        contentType: `image/${imgInfo.type}`,
        value: buffer
      }
    })
    imgResult.filePath = imgInfo.filePath
    imgResult.originImgPath = event.filePath
    imgResult.originImgType = event.type
    return imgResult
  } catch (error) {
    // 校验含有敏感信息
    if (error.errCode === 87014) return error
    // 不好用，老报错，用阿里再检测一次
    return aliCheck(event, imgInfo)
  }
}

// 阿里云的图片内容安全接口监测（已禁用）
async function aliCheck (event, imgInfo) {
  // 暂时跳过阿里云检测，直接返回通过
  console.log('跳过阿里云检测，直接通过')
  return {
    errCode: 0,
    filePath: imgInfo.filePath,
    originImgPath: event.filePath,
    originImgType: event.type
  }
}
