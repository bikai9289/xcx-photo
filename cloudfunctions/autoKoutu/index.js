// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
	env: cloud.DYNAMIC_CURRENT_ENV
})

// 自动抠图，待完成
const access_token = process.env.access_token

// 云函数入口函数
exports.main = async (event, context) => {
	const wxContext = cloud.getWXContext()

	return {
		event,
		openid: wxContext.OPENID,
		appid: wxContext.APPID,
		unionid: wxContext.UNIONID,
	}
}