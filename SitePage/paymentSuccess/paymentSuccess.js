// pages/paymentSuccess/paymentSuccess.js
const formatMoney = (num) => {
  return parseFloat(num || 0).toFixed(2);
};
var app = getApp();
import moment from "moment";
import Thread from "../../utils/Thread";
var timer = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dayactivesList: [],
    payInfo: {},
    voiceTime: 8, //语音播报时间 + 延时2s关闭
    orderInfo: {},
    statusBarHeight: wx.getSystemInfoSync()["statusBarHeight"],
    dialogShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // this.getBackgroundAudioManagerFun();
    // return;
    let orderInfo=options.orderInfo ? JSON.parse(options.orderInfo) : {};
    if(orderInfo.money) {
      orderInfo.money=formatMoney(orderInfo.money);
    }
    if(orderInfo.PayAmount) {
      orderInfo.PayAmount=formatMoney(orderInfo.PayAmount);
    }
 if(orderInfo.totalDiscount) {
      orderInfo.totalDiscount=formatMoney(orderInfo.totalDiscount);
    }

    
    this.setData({
     orderInfo
    });
    this.getPaylList(options.TradeNo);
    this.getdayactivesFun();
  },
  getPaysPaylistFun(TradeNo) {
    // 开始轮询 thread.run();  主动结束轮询 thread.stop(
    wx.showLoading({ title: "查询中...", mask: true });

    let that = this;
    let therad_show = false; // 防止页面卸载 结束监听导致 ，指定由订单查询出来导致
    const thread = new Thread({
      start: function () {
        let parts = {
          TradeNo,
          page_size: 1,
          page_number: 1,
          order_type: 1,
        };
        app.http("/em/v1/pays/paylist", parts, "get").then((res) => {
          if (res.count == 1) {
            therad_show = true;
            thread.stop();
            res.data[0].PayDate = moment(res.data[0].PayDate).format(
              "YYYY-MM-DD HH:mm:ss",
            );
            that.setData({ payInfo: res.data[0] });
            that.getBackgroundAudioManagerFun();
          } else {
            wx.hideLoading();
            let payInfo = that.data.orderInfo;
            that.setData({ payInfo });
            that.getBackgroundAudioManagerFun();
          }
        });
        console.log("轮询中...");
      }, // 轮询开始的回调
      stop: function () {
        if (therad_show) {
          therad_show = false;
        }
        console.log("轮询结束，结束方式：手动结束");
      }, // 轮询结束的回调
      number: 1, //这里是轮询次数配置，不配置默认无线轮询
      time: 3000, //这里是轮询的时间 不配置默认 300ms
    });
    this.thread = thread;
    // 开始轮询
    thread.run();
  },

  getPaylList(TradeNo) {
    let params = {
      TradeNo,
      page_number: 1,
      page_size: 1,
      order_type: 1,
    };
    wx.showLoading({ title: "查询中...", mask: true });
    app.http("/em/v1/pays/paylist", params).then((res) => {
      wx.hideLoading();
      this.setData({ dialogShow: true });
      if (res.count == 0) {
        //this.getPaysPaylistFun(TradeNo); 轮询获取信息
        let payInfo = this.data.orderInfo;
        this.setData({ payInfo });
        this.getBackgroundAudioManagerFun();
      } else {
        res.data[0].PayDate = moment(res.data[0].PayDate).format(
          "YYYY-MM-DD HH:mm:ss",
        );
        this.setData({ payInfo: res.data[0] });
        this.getBackgroundAudioManagerFun();
      }
    });
  },
  onDialogShowClickFun() {
    this.setData({ voiceTime: 0, dialogShow: false });
  },

  // getBackgroundAudioManagerFun() {
  //   this.setData({
  //     payloading: false
  //   });
  //   let backgroundAudioManager = null;
  //   backgroundAudioManager = wx.getBackgroundAudioManager();
  //   backgroundAudioManager.title = "背景音乐";
  //   backgroundAudioManager.src =
  //     "https://admin-ejiablue-com.oss-cn-shenzhen.aliyuncs.com/Applet/wx9816c7566b7fde8f/payment_success.wav";
  //   console.log("backgroundAudioManager", backgroundAudioManager);

  //   timer = setInterval(() => {
  //     if (this.data.voiceTime > 0) {
  //       this.setData({ voiceTime: this.data.voiceTime - 1 });
  //     } else {
  //       clearInterval(timer);
  //       this.setData({ dialogShow: false });
  //     }
  //   }, 1000);
  // },
  getBackgroundAudioManagerFun() {
    this.setData({
      payloading: false,
    });

    // 创建内部音频上下文实例
    const innerAudioContext = wx.createInnerAudioContext();

    // 设置音频属性
    innerAudioContext.title = "背景音乐";
    innerAudioContext.src =
      "https://admin-ejiablue-com.oss-cn-shenzhen.aliyuncs.com/Applet/wx9816c7566b7fde8f/payment_success.wav";

    console.log("innerAudioContext", innerAudioContext);

    // 播放音频
    innerAudioContext.play();

    // 倒计时逻辑保持不变
    let timer = setInterval(() => {
      if (this.data.voiceTime > 0) {
        this.setData({ voiceTime: this.data.voiceTime - 1 });
      } else {
        clearInterval(timer);
        this.setData({ dialogShow: false });
        // 停止音频并释放资源
        innerAudioContext.stop();
        innerAudioContext.destroy();
      }
    }, 1000);

    // 监听音频播放结束事件
    innerAudioContext.onEnded(() => {
      clearInterval(timer);
      this.setData({
        dialogShow: false,
        voiceTime: 0, // 重置倒计时
      });
      innerAudioContext.destroy();
    });

    // 监听音频错误事件
    innerAudioContext.onError((res) => {
      console.error("音频播放错误:", res.errMsg);
      clearInterval(timer);
      innerAudioContext.destroy();
    });
  },

  // 获取每人活动
  getdayactivesFun() {
    let datas = {
      status: 1,
      // type: 1,
      is_activeing: 1,
      page_size: 0,
      page_number: 0,
      placement: 2,
    };
    app.http("/em/v1/dayactives", datas, "GET").then((res) => {
      this.setData({ dayactivesList: res.data });
      console.log(res);
    });
  },
  dayactivesUrlFun(e) {
    let type = e.currentTarget.dataset.type;
    let url = e.currentTarget.dataset.url;
    let id = e.currentTarget.dataset.id;
    let item = e.currentTarget.dataset.item;

    /**
     * type  1 小程序链接  2、小程序H5  3、外部h5
     */
    if (type == 1) {
      wx.navigateTo({
        url: url,
      });
    } else if (type == 2) {
      wx.navigateTo({
        url: "/pages/richText/richText?id=" + id,
      });
    } else if (type == 3) {
      wx.navigateTo({
        url: "/pages/appH5/appH5?url=" + url,
      });
    } else if (type == 4) {
      console.log(" item.app_id", item.app_id);
      wx.navigateToMiniProgram({
        appId: item.app_id,
        path: item.url,
        extraData: {
          foo: "bar",
        },
        envVersion: "release",
        success(res) {
          console.log("打开成功", res);
        },
        fail(res) {
          console.log("打开失败", res);
        },
      });
    }
  },

  async backFn() {
    this.goBack();
  },
  goBack() {
    let pages = getCurrentPages(); // 当前页面
    let beforePage = pages[pages.length - 2]; // 上一页
    if (beforePage) {
      wx.navigateBack({
        delta: 1,
      });
    } else {
      wx.reLaunch({
        url: "/pages/index/index",
      });
    }
  },
  async goHome() {
    wx.reLaunch({
      url: "/pages/index/index",
    });
  },
  makePhone() {
    wx.makePhoneCall({
      phoneNumber: "400-088-6578",
      success: (res) => {},
      fail: (res) => {},
      complete: (res) => {},
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 手动停止轮询
    if (this.thread) this.thread.stop();
    clearInterval(timer);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
