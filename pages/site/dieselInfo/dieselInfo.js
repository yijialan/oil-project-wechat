var app = getApp();
import moment from "moment";
import Dialog from "@vant/weapp/dialog/dialog";
let isModalOpen = false;
// ===== 放在 Page({}) 外部 =====
function parseUrl(url) {
  const params = {};
  try {
    const cleanUrl = url.split('#')[0];
    const queryIndex = cleanUrl.indexOf('?');
    if (queryIndex === -1) return { searchParams: { get: () => null } };

    const queryString = cleanUrl.substring(queryIndex + 1);
    const pairs = queryString.split('&');

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      if (!pair) continue;
      const eqIndex = pair.indexOf('=');
      const key = eqIndex > -1 ? decodeURIComponent(pair.substring(0, eqIndex)) : decodeURIComponent(pair);
      const value = eqIndex > -1 ? decodeURIComponent(pair.substring(eqIndex + 1)) : '';
      params[key] = value;
    }
  } catch (e) {
    console.error('parseUrl error:', e);
  }
  return {
    searchParams: {
      get: (key) => params.hasOwnProperty(key) ? params[key] : null
    }
  };
}

Page({
  data: {
    oilNumindexs: "",
    oliTableObjs: {}, // 当前选中的油品
    selePrices: "", // 选中的预设金额ID
    priceTableList: [
      { id: 1, price: 500 },
      { id: 2, price: 800 },
      { id: 3, price: 1000 },
    ],
    oilNum: [],
    money: "",
    oilLiters: 0,
    totalDiscount: 0,
    finalAmount: 0,
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
    stationId: "",
    isWeChatPay: false, //是否微信支付  有2为微信支付
    userList: {}, //用户信息
    Locations: {},//自己的定位
    connection: false,
  },

  // 获取用户信息
  getusersFun() {
    return new Promise(async (resolve, reject) => {
      await app
        .http(
          `/em/v1/users/unionid/${wx.getStorageSync("userInfo").unionid}`,
          "",
          "get",
        )
        .then((res) => {
          console.log("res.data", res.data);
          this.setData({ userList: res.data });
          resolve();
        })
        .catch((e) => {
          this.showModelError("未获取您登陆信息，请重新扫码");
        });
    });
  },
  showModelError(msg, noCallback = false, title = "温馨提示") {
    wx.showModal({
      title,
      content: msg,
      showCancel: false,
      success: function (res) {
        if (!noCallback) {
          //判断是否需要函数
          wx.exitMiniProgram({
            success: (res) => {
              wx.clearStorageSync();
            },
          });
        }
      },
    });
  },
  // 输入金额--失焦
  moneyInput(e) {
    let value = e.detail.value;
    const numValue = parseFloat(value);
    if (numValue < 2) {
      wx.showModal({
        title: '温馨提示',
        content: '加注金额不能低于￥2.00',
        showCancel: false,
        success: () => {
          this.setData({
            money: '2',
            selePrices: "", // 清空预设选中
          });
          this.calculatePrice();
        }
      });
      return;
    }
  },
  // 防抖标志位（定义在 Page 外部或 data 中均可，这里用闭包变量更简洁）

  moneyInputOnes(e) {
    if (isModalOpen) return; // 防止重复弹窗

    let value = e.detail.value;
    const numValue = parseFloat(value);

    if (numValue > 20000) {
      isModalOpen = true; // 锁定
      wx.showModal({
        title: '温馨提示',
        content: '加注金额不能超过￥20000.00',
        showCancel: false,
        success: () => {
          this.setData({
            money: '20000',
            selePrices: "",
          });
          this.calculatePrice();
          isModalOpen = false; // 解锁
        },
        fail: () => {
          isModalOpen = false; // 确保即使失败也能解锁
        }
      });
      return;
    }

    this.setData({
      money: value,
      selePrices: "",
    });
    this.calculatePrice();
  },

  // 点击预设金额
  selectPreset(e) {
    const { price, id } = e.currentTarget.dataset;
    this.setData({
      money: price,
      selePrices: id,
    });
    this.calculatePrice();
  },

  // 切换油号
  tabOli(e) {
    const item = e.currentTarget ? e.currentTarget.dataset.item : e;
    if (!item || !item.listPrice) return;

    this.setData({
      oliTableObjs: item,
      money: "",
      selePrices: "",
      oilLiters: 0,
      totalDiscount: 0,
      finalAmount: 0,
    });

    // 更新预设金额的优惠
    const priceTableList = this.data.priceTableList.map((list) => {
      const discountValue =
        (list.price / parseFloat(item.listPrice)) *
        parseFloat(item.discountAmount || 0);
      return {
        ...list,
        reduceprice: parseFloat(discountValue.toFixed(2)),
      };
    });
    this.setData({ priceTableList });
  },

  // 统一计算方法
  calculatePrice() {
    const { money, oliTableObjs } = this.data;
    const listPrice = parseFloat(oliTableObjs.listPrice) || 0;
    const discountAmount = parseFloat(oliTableObjs.discountAmount) || 0;

    if (!money || listPrice <= 0) {
      this.setData({
        oilLiters: 0,
        totalDiscount: 0,
        finalAmount: 0,
      });
      return;
    }

    const amount = parseFloat(money);
    const liters = amount / listPrice;
    const totalDiscount = liters * discountAmount;
    const finalAmount = amount - totalDiscount;

    this.setData({
      oilLiters: parseFloat(liters.toFixed(2)),
      totalDiscount: parseFloat(totalDiscount.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
    });
  },

  // 分享站点
  shareFun() {
    wx.navigateTo({
      url:
        "/pages/site/dieselInfo/dieselInfo?stationId=" + this.data.stationId,
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
      this.setData({ activeShow: true });
    }
  },

  // 预览图片
  previewImage(e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current,
      urls: this.data.sitePic,
    });
  },

  ishxstationFun() {
    wx.redirectTo({
      url: `/highSpeedVerification/orgDetail/orgDetail?org_id=${this.data.siteInfoData.org_id || 151}`,
    });
  },


  // 扫码加注
  jiazhu() {
    wx.scanCode({
      onlyFromCamera: true,
      success: (result) => {
        console.log(result, '---------result');
        const fullUrl = result.result;
        console.log(fullUrl, '---------fullUrl');

        // 判断是否是本小程序的站点二维码
        if (fullUrl.includes('wx.ejiablue.com') && fullUrl.includes('/site')) {
          try {
            // ✅ 使用自定义解析函数，替代 new URL()
            const url = parseUrl(fullUrl);
            const stationId = url.searchParams.get('stationId');
            const connection = url.searchParams.get('connection');

            if (!stationId) {
              wx.showToast({ title: '二维码缺少站点ID', icon: 'none' });
              return;
            }

            // 跳转到本小程序的柴油信息页
            wx.redirectTo({
              url: `/pages/site/dieselInfo/dieselInfo?stationId=${stationId}${connection ? `&connection=${connection}` : ''}`
            });
          } catch (e) {
            console.error('解析二维码失败', e);
            wx.showToast({ title: '二维码格式错误', icon: 'none' });
          }
        } else {
          wx.showToast({ title: '不支持的二维码', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('扫码失败', err);
      }
    });
  },

  toIndex() {
    wx.reLaunch({ url: "/pages/site/site" });
  },
  getDistanceMatrix() {
    let that = this;
    let Locations = that.data.Locations;
    let objs = {
      mode: 'driving',
      from: `${Locations.latitude},${Locations.longitude}`,
      to: `${that.data.siteInfoData.latitude},${that.data.siteInfoData.longitude}`
    };

    app.sadminHttp("/api/truck/distanceMatrix", objs, "POST").then(res => {


      // ✅ 提取 distance（单位：米），转为公里
      const distanceInMeters = res?.data?.result?.rows?.[0]?.elements?.[0]?.distance || 0;
      const distanceInKm = (distanceInMeters / 1000).toFixed(1); // 保留1位小数，如 "19.6"

      const updatedSiteInfoData = {
        ...that.data.siteInfoData,
        juli: distanceInKm // 直接存数字或字符串均可，WXML 会渲染
      };

      that.setData({
        siteInfoData: updatedSiteInfoData
      });
    }).catch(err => {
      console.error('距离计算失败', err);
      // 可选：失败时保留原始 juli 或设为 '--'
    });
  },

  async getLocations() {
    let that = this;
    wx.getLocation({
      type: "gcj02",
      success: async function (res) {
        let stationId = that.data.stationId;
        let { data } = await app.sadminHttp(
          `/api/gasStation/detail/${stationId}`,
          {},
          "GET",
        );
        if (!data || Object.keys(data).length === 0) {
          app.showError("没有查到该站点,返回列表页", () => {
            wx.navigateBack();
          });
          return;
        }


        const serviceTags = data.serviceTags
          ? data.serviceTags.split("#").filter((tag) => tag.trim())
          : [];
        let isWeChatPay = data.paymentMode.includes("2") || that.data.connection;
        data.serviceTags = serviceTags;
        that.setData({ siteInfoData: data, isWeChatPay, Locations: res });
        that.getDistanceMatrix()

        that.getProductsList();
      },
      fail: () => {
        app.showError("获取位置失败");
      },
    });
  },

  getProductsList() {
    app
      .sadminHttp(`/api/gasStation/${this.data.stationId}/products`, {}, "GET")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const oilNum = res.data.map((item) => ({
            ...item,
            oilGrade: item.oilGrade || item.name, // 兼容字段
          }));
          this.setData({ oilNum });
          this.tabOli(oilNum[0]); // 默认选中第一个


        }
      })
      .catch((err) => {
        console.error("获取油品列表失败", err);
      });
  },

  setInfo(data) {
    let item = { ...this.data.siteInfoData, ...data };
    item.juli = (item.juli / 1000).toFixed(2);

    if (item.imgs) {
      this.setData({ sitePic: item.imgs.split("|") });
    } else {
      this.setData({
        sitePic: [
          "https://admin-ejiablue-com.oss-cn-shenzhen.aliyuncs.com/Applet/wx9816c7566b7fde8f/20220328111817_1648437559376.jpg",
        ],
      });
    }

    if (item.tag) {
      this.setData({ label: item.tag.split("|") });
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

    this.setData({
      siteInfoData: item,
      star: Math.floor(item.score),
    });
  },

  getActive() {
    app
      .http(
        `/em/v1/actives?oseqpt_id=${this.data.EqptId}&page_number=1&page_size=20&is_activeing=1`,
      )
      .then((res) => {
        this.setData({
          "siteInfoData.actives": res.data,
          "siteInfoData.showActive":
            res.data.length > 2 ? res.data.slice(0, 2) : res.data,
        });
      });
  },
  //   点击微信支付
  wxpay() {
    let that = this;
    console.log("点击微信支付");
    if (!this.data.finalAmount) {
      return wx.showToast({
        title: "请输入加注金额",
        icon: "none",
      });
    }

    this.llPaOrderFun();
  },
  async llPaOrderFun() {
    // 2. 构建订单参数
    const datas = {
      user_id: this.data.userList.memberId,
      busi_type: "100002",
      order_amount: Number(this.data.finalAmount),
      openId: wx.getStorageSync("userInfo").openid,
      order_info: "柴油加注",
      pay_expire: 2,
      payType: "WECHAT_APPLET",
      busiOrderType: "gas_station", //业务订单类型
      goods_info: [
        {
          goods_id: "001",
          goods_name: "柴油加注",
          goods_category: "string",
          goods_quantity: 0,
          goods_price: 0,
          goods_body: "string",
        },
      ],
      busiParams: {
        gasStationOrderReq: {
          stationId: this.data.stationId,
          productId: this.data.oliTableObjs.productId,
          paymentAmount: Number(this.data.finalAmount),
          driverPhone: this.data.userList.memberMobile,
          remark: "柴油加注",
        }
      },
      orderNumber: "",
    };

    try {
      // 3. 显示加载
      wx.showLoading({ title: "创建订单中..." });

      // 4. 创建连连支付订单
      const { data: createOrder_res } = await app.sadminHttp(
        "/app/pay/llPay/createOrder",
        datas,
        "post",
      );

      // 5. 获取支付参数
      const { data: payOrder_res } = await app.sadminHttp(
        "/app/pay/llPay/payOrder",
        { orderNumber: createOrder_res.orderNumber },
        "post",
      );

      // 6. 解析支付参数
      let payload = payOrder_res.payload
        ? JSON.parse(payOrder_res.payload)
        : "";
      if (!payload) {
        throw new Error("支付参数获取失败");
      }
      payload.metadata.trade_no = payOrder_res.orderNumber;
      console.log(
        "createOrder_res",
        createOrder_res,
        "payOrder_res",
        payOrder_res,
      );
      // 7. 隐藏加载
      wx.hideLoading();
      // 8. 调起微信支付
      this.payParams(payload.metadata);
    } catch (error) {
      wx.hideLoading();
      console.error("支付失败", error);
      wx.showToast({
        title: "支付创建失败，请重试",
        icon: "none",
      });
    }
  },
  // 调起微信支付
  payParams(params) {
    let that = this
    wx.requestPayment({
      appId: params.appId,
      timeStamp: params.timeStamp,
      nonceStr: params.nonceStr,
      package: params.package,
      signType: params.signType,
      paySign: params.paySign,
      success: (res) => {
        if (res.errMsg === "requestPayment:ok") {
          // 支付成功
          let objs = {
            StationName: that.data.siteInfoData.stationName,
            oilGrade: that.data.oliTableObjs.oilGrade,
            PayType: that.data.isWeChatPay ? "微信" : "电子卡",
            PayAmount: Number(that.data.finalAmount),//实际支付金额
            TradeNo: params.trade_no,
            ICNum: "cardNum",
            PayDate: moment().format("YYYY-MM-DD HH:mm:ss"),
            money: Number(that.data.money),//加注金额
            totalDiscount: Number(that.data.totalDiscount),//优惠金额


          };

          console.log("提交给成功页的JSON", objs);
          wx.showToast({ title: "支付成功" });
          // 可跳转到支付成功页
          wx.navigateTo({
            url: `/pages/paymentSuccess/paymentSuccess?TradeNo=${params.trade_no}&orderInfo=${JSON.stringify(objs)}`,
          });
        }
      },
      fail: (err) => {
        console.error("支付失败", err);
        wx.showToast({ title: "支付取消或失败", icon: "none" });
      },
    });
  },
  async onLoad(options) {
    if (options.scene) {
      const scene = decodeURIComponent(options.scene);
      console.log("scene", scene);
      if (scene) {
        let hash = {};
        let uri = decodeURIComponent(scene).split("?")[1] || [];
        uri.split("&").forEach(item => {
          let [key, value] = item.split("=");
          hash[key] = value;
        });
        options = hash;
      }
    }
    if (options.q) {
      let hash = {};
      let uri = decodeURIComponent(options.q).split("?")[1] || [];
      uri.split("&").forEach(item => {
        let [key, value] = item.split("=");
        hash[key] = value;
      });
      options = hash;
    }
    console.log('options', options)
    await app.loginFun();

    if (wx.getStorageSync("userInfo")?.unionid) {
      this.getusersFun(); //获取用户信息
    }

    this.setData({ stationId: options.stationId, connection: options.connection ? true : false });
    this.getLocations();
    if (wx.getStorageSync("channel")) this.memberChannels();
  },

  getWeixinLoginInfo() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject,
      });
    });
  },

  async memberChannels() {
    const datas = {
      channel_name: wx.getStorageSync("channel"),
      channel_pages: "pages/site/tripartiteInfo/tripartiteInfo",
    };
    try {
      let loginInfo = await this.getWeixinLoginInfo();
      let sessionInfo = await app.http(
        `/os/v1/users/sessionkey/${loginInfo.code}?type=3`,
        "",
        "get",
      );
      if (sessionInfo) datas.unionid = sessionInfo.data.unionid;

      const adInfo = wx.getStorageSync("ad_info") || {};
      datas.address = adInfo.name || "";
      datas.latitude = adInfo.location?.lat || 0;
      datas.longitude = adInfo.location?.lng || 0;

      app.http(`/em/v1/member_channels`, datas, "post");
    } catch (error) {
      console.error("memberChannels error", error);
    }
  },

  lan() {
    let Data = this.data.siteInfoData;
    wx.openLocation({
      longitude: Number(Data.longitude),
      latitude: Number(Data.latitude),
      name: Data.stationName,
      address: Data.address,
    });
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  showImg() {
    this.setData({ imgShow: true });
  },

  showFn() {
    this.setData({ show: !this.data.show });
  },

  onShow() {
    app.loginFun();
  },
});
