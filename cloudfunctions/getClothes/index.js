// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
	env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数，获取换装的图片地址
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const clothes = {}
  clothes.nan = await getByTag('nan')
  clothes.nv = await getByTag('nv')
  clothes.other = await getByTag('other')

  return {
    event,
    clothes,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

// 查询图片地址
async function getByTag (tag) {
  const { data } = await db.collection('resource-images').where({
    type: 'clothes',
    tag,
  }).get()

  return (Array.isArray(data) ? data : [])
    .map((item, index) => {
      const src = item.src || item.url || item.fileID || item.fileId || item.imgurl || ''
      return {
        ...item,
        _id: item._id || `${tag}-${index}`,
        src,
        thumbSrc: item.thumbSrc || item.thumbnail || item.thumb || src,
      }
    })
    .filter(item => item.src && !item.src.includes('你的云存储地址'))
}
