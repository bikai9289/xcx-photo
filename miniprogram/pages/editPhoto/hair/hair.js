// miniprogram/pages/editPhoto/imageStyle/imageStyle.js
// 在页面中定义激励视频广告
let videoAd = null
// 在页面中定义插屏广告
let interstitialAd = null
let imgUrl = ''
const allHair = {}
const PAGE_SIZE = 6
const TAB_KEYS = ['nv', 'nan']

function normalizeImages(list = []) {
	return (Array.isArray(list) ? list : [])
		.map((item, index) => {
			const src = item.src || item.url || item.fileID || item.fileId || item.imgurl || ''
			return {
				...item,
				_id: item._id || `${item.tag || 'hair'}-${index}`,
				src,
				thumbSrc: item.thumbSrc || item.thumbnail || item.thumb || src
			}
		})
		.filter(item => item.src && !item.src.includes('你的云存储地址'))
}

async function getHairData() {
	try {
		const { result = {} } = await wx.cloud.callFunction({
			name: 'getHairs',
		})
		return result.hairs || {}
	} catch (error) {
		console.warn('getHairs 云函数调用失败，尝试直接读取数据库', error)
		const db = wx.cloud.database()
		const hairs = {}
		await Promise.all(TAB_KEYS.map(async key => {
			const { data = [] } = await db.collection('resource-images').where({
				type: 'hairs',
				tag: key
			}).get()
			hairs[key] = data
		}))
		return hairs
	}
}

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		TabCur: 0,
		videoLoaded: false,
		loading: false,
		loadError: false,
		emptyText: '',
		imgList: {
			nan: [],
			nv: []
		}
	},

  // 切换男女
	tabSelect(e) {
    this.setData({
      TabCur: +e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
	},
	  
	  // 选择发型，开始看视频
	selectImg (e) {
		imgUrl = e.currentTarget.dataset.url
		if (!imgUrl) {
			return wx.showToast({ title: '图片地址无效', icon: 'none' })
		}
		// 用户触发广告后，显示激励视频广告
		if (videoAd) {
			videoAd.show().catch(() => {
				// 失败重试
				videoAd.load()
					.then(() => videoAd.show())
					.catch(err => {
						console.log('激励视频 广告显示失败')
						this.back()
					})
			})
		} else {
			this.back()
		}
	},

	  // 返回页面，传递图片地址
	back () {
		const eventChannel = this.getOpenerEventChannel && this.getOpenerEventChannel()
    eventChannel && eventChannel.emit('selectHair', {imgUrl})
		wx.navigateBack({})
	},

	  // 获取发型列表
	async getData () {
		if (this.data.loading) return
		this.setData({ loading: true, loadError: false, emptyText: '' })
		wx.showLoading({ title: '稍等片刻...', })
		try {
	    const hairs = await getHairData()
	    TAB_KEYS.forEach(key => {
	    	allHair[key] = normalizeImages(hairs[key])
	    })
	    const hasData = TAB_KEYS.some(key => allHair[key].length > 0)
			this.setData({
				imgList: {
	        nan: allHair.nan.slice(0, PAGE_SIZE),
	        nv: allHair.nv.slice(0, PAGE_SIZE),
	      },
	      emptyText: hasData ? '' : '暂无可用发型，请检查 resource-images 数据'
			})
		} catch (error) {
			console.error('获取发型列表失败', error)
			this.setData({
				loadError: true,
				emptyText: '发型加载失败，请稍后重试'
			})
			wx.showToast({ title: '发型加载失败', icon: 'none' })
		} finally {
			this.setData({ loading: false })
			wx.hideLoading()
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.setNavigationBarTitle({ title: '免冠照发型' })
		this.getData()

		// 在页面onLoad回调事件中创建激励视频广告实例
		if (wx.createRewardedVideoAd) {
			videoAd = wx.createRewardedVideoAd({
				adUnitId: 'adunit-240d1c7fb731d343'
			})
			videoAd.onLoad(() => {
				this.setData({
					videoLoaded: true
				})
			})
			videoAd.onError((err) => {
				this.setData({
					videoLoaded: false
				})
			})
			videoAd.onClose((res) => {
				console.log(res)
				if (res && res.isEnded) {
					if(imgUrl) this.back()
				} else {
					wx.showToast({
						title: '看完才可以使用哦',
						icon: 'none'
					})
				}
			})
		}

		// 在页面onLoad回调事件中创建插屏广告实例
		if (wx.createInterstitialAd) {
			interstitialAd = wx.createInterstitialAd({
				adUnitId: 'adunit-71fe77c8c4d0e3ca'
			})
			interstitialAd.onLoad(() => {})
			interstitialAd.onError((err) => {})
			interstitialAd.onClose(() => {})
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		// 在适合的场景显示插屏广告
		if (interstitialAd) {
			interstitialAd.show().catch((err) => {
				console.error(err)
			})
		}
  },
  
  // 触底加载
  onReachBottom() {
    const key = TAB_KEYS[this.data.TabCur]
    const currentList = this.data.imgList[key] || []
    const fullList = allHair[key] || []
    if (currentList.length === fullList.length) return
    this.setData({
      imgList: {
        ...this.data.imgList,
        [key]: fullList.slice(0, currentList.length + PAGE_SIZE)
      }
    })
  }
})
