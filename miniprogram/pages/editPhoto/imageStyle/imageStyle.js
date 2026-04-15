// miniprogram/pages/editPhoto/imageStyle/imageStyle.js
// 在页面中定义激励视频广告
let videoAd = null
// 在页面中定义插屏广告
let interstitialAd = null
let imgUrl = ''
const allClothes = {}
const PAGE_SIZE = 6
const TAB_KEYS = ['nv', 'nan', 'other']

function normalizeImages(list = []) {
	return (Array.isArray(list) ? list : [])
		.map((item, index) => {
			const src = item.src || item.url || item.fileID || item.fileId || item.imgurl || ''
			return {
				...item,
				_id: item._id || `${item.tag || 'clothes'}-${index}`,
				src,
				thumbSrc: item.thumbSrc || item.thumbnail || item.thumb || src
			}
		})
		.filter(item => item.src && !item.src.includes('你的云存储地址'))
}

async function getClothesData() {
	try {
		const { result = {} } = await wx.cloud.callFunction({
			name: 'getClothes',
		})
		return result.clothes || {}
	} catch (error) {
		console.warn('getClothes 云函数调用失败，尝试直接读取数据库', error)
		const db = wx.cloud.database()
		const clothes = {}
		await Promise.all(TAB_KEYS.map(async key => {
			const { data = [] } = await db.collection('resource-images').where({
				type: 'clothes',
				tag: key
			}).get()
			clothes[key] = data
		}))
		return clothes
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
			nv: [],
			other: []
		}
	},

	tabSelect(e) {
    this.setData({
      TabCur: +e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
	},
		
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

	back () {
		const eventChannel = this.getOpenerEventChannel && this.getOpenerEventChannel()
    eventChannel && eventChannel.emit('selectClothes', {imgUrl})
		wx.navigateBack({})
	},

	async getData () {
		if (this.data.loading) return
		this.setData({ loading: true, loadError: false, emptyText: '' })
		wx.showLoading({
			title: '稍等片刻...',
		})
		try {
	    const clothes = await getClothesData()
	    TAB_KEYS.forEach(key => {
	    	allClothes[key] = normalizeImages(clothes[key])
	    })
	    const hasData = TAB_KEYS.some(key => allClothes[key].length > 0)
			this.setData({
				imgList: {
	        nan: allClothes.nan.slice(0, PAGE_SIZE),
	        nv: allClothes.nv.slice(0, PAGE_SIZE),
	        other: allClothes.other.slice(0, PAGE_SIZE)
	      },
	      emptyText: hasData ? '' : '暂无可用服装，请检查 resource-images 数据'
			})
		} catch (error) {
			console.error('获取服装列表失败', error)
			this.setData({
				loadError: true,
				emptyText: '服装加载失败，请稍后重试'
			})
			wx.showToast({ title: '服装加载失败', icon: 'none' })
		} finally {
			this.setData({ loading: false })
			wx.hideLoading()
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.setNavigationBarTitle({ title: '证件照换装' })
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
				adUnitId: 'adunit-ef203d1fea23c207'
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
    const fullList = allClothes[key] || []
    if (currentList.length === fullList.length) return
    this.setData({
      imgList: {
        ...this.data.imgList,
        [key]: fullList.slice(0, currentList.length + PAGE_SIZE)
      }
    })
  }

})
