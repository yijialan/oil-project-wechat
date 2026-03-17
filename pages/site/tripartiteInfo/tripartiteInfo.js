var app = getApp();
import Dialog from "@vant/weapp/dialog/dialog";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    sitePic: [],
    indicatorDots: false,
    autoplay: true,
    interval: 3000,
    duration: 800,
    star: 5,
    siteInfoData: {},
    siteInfo: {
      siteStatue: "营业中",
      time: "00:00-24:00",
      car: "停车免费",
    },
    label: [],
    // 公司信息
    company: {
      name: "湖南壹加蓝信息技术有限公司",
      phone: "136-8564-8836",
      car: "停车免费",
    },
    activeShow: false,
    url: "",
    EqptId: "",
    imgShow: false,
    show: false,
  },
  // 帮助
  invoiceHelp() {
    wx.navigateTo({
      url: "/pages/invoicingMmodular/invoiceHelp/invoiceHelp",
    });
  },
  // 分享站点
  shareFun() {
    wx.navigateTo({
      url: "/pages/tuijian/tuijian?EqptCode=" + this.data.siteInfoData.EqptCode,
    });
  },
  // 活动
  activeFun(e) {
    let orgid = e.currentTarget.dataset.orgid;
    let type = e.currentTarget.dataset.type;
    if (type == 1) {
      wx.navigateTo({
        url: `/pages/activityCardList/activityCardList?orgid=${orgid}`,
      });
    } else {
      this.setData({
        activeShow: true,
      });
    }
  },
  //预览轮播图片
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current,
      // 当前显示图片的http链接
      urls: this.data.sitePic,
      // 需要预览的图片http链接列表
    });
  },
  ishxstationFun() {
    wx.redirectTo({
      url: `/highSpeedVerification/orgDetail/orgDetail?org_id=${
        this.data.siteInfoData.org_id || 151
      }`,
    });
  },
  // 扫码加注
  jiazhu: function () {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: [],
      success: (result) => {
        app.resultFun(result);
      },
      fail: (res) => {},
      complete: (res) => {},
    });
  },
  toIndex() {
    wx.reLaunch({
      url: "/pages/index/index",
    });
  },
  async getLocations(code) {
    let that = this;
    console.log("进入");
    wx.getLocation({
      type: "gcj02", // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: async function (res) {
        console.log("获取当前定位", res);
        let la = res.latitude;
        let lo = res.longitude;
        let row = {
          lon: lo,
          lat: la,
          page_size: 20,
          page_number: 1,
          OrgId: 431,
          is_online: 1,
          is_bc: 0,
          EqptCode: code, //页面传参
          is_map_show: 1,
        };

        let { data } = await app.http("/em/v1/eqpts/distance", row, "GET");
        if (data.length == 0) {
          app.showError("没有查到该站点,返回列表页", () => {
            wx.navigateBack();
          });
          return;
        }
        let hasEqpt = false; //是否有站点
        data.forEach((item) => {
          if (item.EqptId == that.data.EqptId) {
            hasEqpt = true;
            if (item.actives.length > 2) {
              item.actives = item.actives.slice(0, 2);
            }
			console.log(item);
			
			if((item.is_zy==1 && item.Price && 10 > item.Price) || (item.is_other==1 && item.open_fill == 1) || (!item.is_zy&&!item.is_other)) {
				item.notShowUrea = true
			}

            that.setData({
              siteInfoData: item,
              url: item.is_zy
                ? `/em/v1/eqpts/${item.EqptId}`
                : `/os/v1/eqpts/${item.EqptId}`,
            });

            // if(!item.is_zy){
            // 	that.getActive()
            // }
          }
        });
        if (!hasEqpt) {
          data[0].juli = (data[0].juli / 1000).toFixed(2);
          if (data[0].imgs) {
            that.setData({
              sitePic: data[0].imgs.split("|"),
            });
          } else {
            that.setData({
              sitePic: [
                "https://admin-ejiablue-com.oss-cn-shenzhen.aliyuncs.com/Applet/wx9816c7566b7fde8f/20220328111817_1648437559376.jpg",
              ],
            });
          }
          if (data[0].tag) {
            this.setData({
              label: data[0].tag.split("|"),
            });
          }
          that.setData({
            siteInfoData: data[0],
          });
          return;
        }
         if((that.data.siteInfoData.is_zy || that.data.siteInfoData.is_other)){
			that.getDistanceFun();
		 } else {
			that.setInfo({})
		 }
      },
    });
  },
  setInfo(data){
	let item = Object.assign(this.data.siteInfoData, data);
      // 缓存中得到
      // let item = wx.getStorageSync("siteStorage")
      item.juli = (item.juli / 1000).toFixed(2);
      if (item.imgs) {
        this.setData({
          sitePic: item.imgs.split("|"),
        });
      } else {
        this.setData({
          sitePic: [
            "https://admin-ejiablue-com.oss-cn-shenzhen.aliyuncs.com/Applet/wx9816c7566b7fde8f/20220328111817_1648437559376.jpg",
          ],
        });
      }
      if (item.tag) {
        this.setData({
          label: item.tag.split("|"),
        });
      }
      switch (item.SiteType) {
        case 1:
          item.SiteTypeStr = "服务区";
          break;
        case 2:
          item.SiteTypeStr = "加油站";
          break;
        case 3:
          item.SiteTypeStr = "物流园";
          break;
        case 4:
          item.SiteTypeStr = "其他";
          break;
        default:
          break;
      }
      //    item.oil_prices = "0#|7.00,-10|7.10,0#|7.00";
      let arr = item.oil_prices ? item.oil_prices.split(",") : [];
      let arr1 = [];
      arr.forEach((item1) => {
        arr1.push({
          name: item1.split("|")[0],
          price: item1.split("|")[1],
        });
      });
      item.oil_pricesList = arr1;

      item.commodityList = item.commoditys
        ? JSON.parse(item.commoditys).filter((item1) => {
            return item1.stock;
          })
        : [];

      this.setData({
        siteInfoData: item,
        star: Math.floor(item.score),
      });
  },
  getDistanceFun(row) {
    app.http(this.data.url).then((res) => {
      this.setInfo(res.data)
    });
  },
  getActive() {
    app
      .http(
        `/em/v1/actives?oseqpt_id=${this.data.EqptId}&page_number=1&page_size=20&is_activeing=1`
      )
      .then((res) => {
        this.setData({
          [`siteInfoData.actives`]: res.data,
          [`siteInfoData.showActive`]:
            res.data.length > 2 ? res.data.slice(0, 2) : res.data,
        });
      });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let code = decodeURIComponent(options.EqptCode);
    console.log("code,", decodeURIComponent(code));
    wx.setNavigationBarTitle({
      title: code,
    });
    // code = '长沙京东物流园2号'
    this.setData({
      EqptId: options.EqptId,
    });
    this.getLocations(code);
    if (wx.getStorageSync("channel")) this.memberChannels();
  },
  // 获取登录信息
  getWeixinLoginInfo() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: function (res) {
          console.log("获取登录信息");
          console.log(res);
          resolve(res);
        },
        fail: function (error) {
          reject(error);
        },
      });
    });
  },

  async memberChannels() {
    const datas = {
      channel_name: wx.getStorageSync("channel"),
      channel_pages: "pages/site/tripartiteInfo/tripartiteInfo",
    };
    // 获取登录信息
    let loginInfo = await this.getWeixinLoginInfo();
    // 通过code获取unid/openid
    let sessionInfo = await app.http(
      `/os/v1/users/sessionkey/${loginInfo.code}?type=5`,
      "",
      "get"
    );
    if (sessionInfo) datas.unionid = sessionInfo.data.unionid;
    // 处理经纬度
    const {
      name,
      location: { lat, lng },
    } = wx.getStorageSync("ad_info") || {};
    datas.address = name;
    datas.latitude = lat;
    datas.longitude = lng;

    app.http(`/em/v1/member_channels`, datas, "post");
  },
  lan() {
    let Data = this.data.siteInfoData;
    wx.openLocation({
      //​使用微信内置地图查看位置。
      longitude: Number(Data.Longitude), //要去的经度-地址
      latitude: Number(Data.Latitude), //要去的纬度-地址
      name: Data.EqptCode, //导航名称
      address: Data.address, //地址
    });
  },
  showImg() {
    this.setData({ imgShow: true });
  },
  showFn() {
    this.setData({ show: !this.data.show });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.loginFun();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (option) {
    return {
      title: this.data.siteInfoData.EqptCode,
    };
  },
});
