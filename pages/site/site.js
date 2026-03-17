var app = getApp();
import tool from "../../utils/tool";
// 引入SDK核心类-腾讯地图
var QQMapWX = require("../../utils/qqmap-wx-jssdk.js");
var qqmap = new QQMapWX({
  key: "AHPBZ-HC7C4-K6QUV-KNHJ4-TEM5H-DLBNQ",
});

const TABLE_LIST = [
  { title: "尿素", id: 0 },
  { title: "柴油", id: 1 },
];

const getDefaultOptionList = () => [
  {
    title: "类型",
    list: [
      { title: "全部", value: "0", checkd: true },
      { title: "自营", value: "1", checkd: false },
      { title: "优选", value: "2", checkd: false },
    ],
  },
  {
    title: "场地",
    list: [
      { title: "全部", value: "", checkd: true },
      { title: "加油站", value: "2", checkd: false },
      { title: "服务区", value: "1", checkd: false },
      { title: "物流园", value: "3", checkd: false },
      { title: "其他", value: "4", checkd: false },
    ],
  },
  {
    title: "服务（多选）",
    list: [
      { title: "柴油", value: "柴油", checkd: false },
      { title: "汽油", value: "汽油", checkd: false },
      { title: "散装尿素", value: "散装尿素", checkd: false },
      { title: "桶装尿素", value: "桶装尿素", checkd: false },
      { title: "超市", value: "超市", checkd: false },
      { title: "加水", value: "加水", checkd: false },
      { title: "洗车", value: "洗车", checkd: false },
      { title: "汽修", value: "汽修", checkd: false },
    ],
    multiple: true,
  },
];

const LOAD_STATUS = {
  LOADING: "loading",
  LOADMORE: "loadmore",
  NOMORE: "nomore",
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isSearching: false,
    inputValue: "", //模糊搜索
    condition: false,
    tableList: TABLE_LIST,
    oilTexts: "", //油号传值参数
    getLocation: wx.getStorageSync("getLocation"),
    popupType: 0, // 0 全部，1自营。2，优选，3合作
    SiteType: "",
    tags: "",
    headTable: 0, //设置头部下标 //主回应到的table index
    activeShow: false,
    isHide: false,
    statusBarHeight: app.globalData.statusBarHeight,
    page_number: 1,
    status: LOAD_STATUS.LOADMORE,
    listData: [],
    optionList: getDefaultOptionList(),
    dayactivesList: [],
    isSearch: true,
    hasLocationPersmiss: false,
    keyWord: "",
    headShow: false,
    configsData: {},
    preferentialShow: false,
    // 👇 新增防重锁
    isFetching: false,
  },

  // 接收子组件的搜索/筛选事件 
onSearchFromChild(e) {
  if (this.data.isSearching) return;

  const { keyword, filters, oilTexts } = e.detail;
  this.setData({
    inputValue: keyword,
    popupType: filters["类型"] || "0",
    SiteType: filters["场地"] || "",
    tags: filters["服务（多选）"] || "",
    oilTexts: oilTexts || "", // 安全默认
    isSearch: false,
    listData: [],
    page_number: 1,
    status: LOAD_STATUS.LOADMORE,
    isSearching: true,
  });

  this.resetList().finally(() => {
    this.setData({ isSearching: false });
  });
},


  // 获取定位（不再自动加载列表）
  getLocations: function () {
    let that = this;
    wx.getLocation({
      type: "gcj02",
      success: function (res) {
        wx.setStorageSync("getLocation", res);

        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          getLocation: res,
          myLatitude: res.latitude,
          myLongitude: res.longitude,
          hasLocationPersmiss: true,
        });

        // 逆地理编码获取城市
        qqmap.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude,
          },
          success: function (resGeo) {
            var address = resGeo.result.address_component;
            const ad_info = resGeo.result.ad_info;
            wx.setStorageSync("ad_info", ad_info);
            that.setData({
              cityName: address.city,
            });
          },
        });
        that.safeLoadList();
      },
      fail: () => {
        this.setData({ hasLocationPersmiss: false });
      },
    });
  },
  initTabbar() {
    var template = require("../tabbar/tabbar.js");
    template.tabbar("tabBar", 0, this);
  },

  safeLoadList() {
    if (!this.data.hasLocationPersmiss) return;
    this.getList();
  },

  // 底部扫码

  // 头部 tab 点击
  handleTabClick(e) { 
    let objs = e.detail;
    // if (this.data.headTable == objs.currentIndex) return;

    this.setData({
      headTable: objs.currentIndex,
      popupType: "",
      oilTexts: "",
      listData: [],
      status: LOAD_STATUS.LOADMORE,
      page_number: 1,
    });

    this.safeLoadList();
  },


  // 导航
  getLocationTwos: function (e) { 
    let objs=e.currentTarget.dataset.item;
    let lon = objs.Longitude||objs.longitude;
    let lat = objs.Latitude||objs.latitude;
    let name = objs.EqptCode||objs.stationName;
    let address = objs.address||objs.address;
    wx.openLocation({
      longitude: Number(lon),
      latitude: Number(lat),
      name: name,
      address: address,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 获取导航参数 并设置 
    if(options.headTable){
      this.getLocationFun(options.headTable)
     
    }
    if (options.from == "osFill") {
      this.setData({ isHide: true });
    }
    if (options.channel) {
      if (!wx.getStorageSync("channel"))
        wx.setStorageSync("channel", options.channel);
    }

    if (wx.getStorageSync("channel")) this.memberChannels();

    let result = await tool.initLocationPersmiss();
    if (result) {
      this.getLocations();
      this.setData({ hasLocationPersmiss: true });
    }
    this.getLocation = wx.getStorageSync("getLocation");

    this.initTabbar();
  },
  // getLocationFun
  getLocationFun(headTables) {
    const targetId =
      typeof headTables === "string" ? parseInt(headTables, 10) : headTables;

    const headTableObjs = this.data.tableList.find(
      (item) => item.id === targetId
    );

    this.setData({ headTable: headTableObjs ? headTableObjs.id : 0 });
  },
  // 获取登录信息
  getWeixinLoginInfo() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: function (res) {
          
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
      channel_pages: "pages/site/site",
    };
    let loginInfo = await this.getWeixinLoginInfo();
    let sessionInfo = await app.http(
      `/os/v1/users/sessionkey/${loginInfo.code}?type=5`,
      "",
      "get"
    );
    if (sessionInfo) datas.unionid = sessionInfo.data.unionid;

    const adInfo = wx.getStorageSync("ad_info") || {};
    const wxgetLocation = wx.getStorageSync("getLocation");

    datas.address = adInfo.name;
    datas.latitude = wxgetLocation.latitude;
    datas.longitude = wxgetLocation.longitude;

    app.http(`/em/v1/member_channels`, datas, "post");
  },


  async resetList() {
    if (!this.data.hasLocationPersmiss) {
      let result = await tool.initLocationPersmiss();
      if (!result) return;
      this.setData({
        listData: [],
        status: LOAD_STATUS.LOADMORE,
        page_number: 1,
        hasLocationPersmiss: true,
      });
      this.getLocations();
      // 定位后稍等再加载（简单方案）
      setTimeout(() => {
        if (this.data.hasLocationPersmiss) {
          this.safeLoadList();
        }
      }, 500);
    } else {
      this.setData({
        listData: [],
        status: LOAD_STATUS.LOADMORE,
        page_number: 1,
      });

      this.safeLoadList();
    }
  },

  onSearch() {
    this.setData({ isSearch: true });
    this.resetOption();
    this.resetList();
  },

  resetOption() {
    let data = getDefaultOptionList();
    this.setData({
      optionList: data,
      keyWord: "",
    });
  },


  // 详情
  goPage: function (e) {
    let item = e.currentTarget.dataset.item;
    if (item.fault_title)
      return wx.showToast({
        title: item.fault_title,
        duration: 3000,
        icon: "none",
      });
    wx.navigateTo({
      url: `/pages/site/tripartiteInfo/tripartiteInfo?EqptId=${item.EqptId}&EqptCode=${item.EqptCode}`,
    });
  },

  // 获取尿素列表
  getUreaList() {
    return new Promise((resolve, reject) => {
      if ([LOAD_STATUS.NOMORE, LOAD_STATUS.LOADING].includes(this.data.status)) {
        return resolve();
      }

      if (!this.data.getLocation || !this.data.getLocation.longitude) {
        this.setData({ status: LOAD_STATUS.NOMORE });
        return resolve();
      }

      wx.showLoading({ title: "加载中...", mask: true });
      this.setData({ status: LOAD_STATUS.LOADING });

      let datas = {
        lon: this.data.getLocation.longitude,
        lat: this.data.getLocation.latitude,
        page_size: 20,
        page_number: this.data.page_number,
        OrgId: 431,
        is_online: 1,
        is_bc: 0,
        is_map_show: 1,
        type: this.data.popupType,
      };

      if (this.data.isSearch) {
        if (this.data.inputValue) datas.EqptCode = this.data.inputValue;
        datas.type = 0;
      } else {
        if (this.data.inputValue) datas.EqptCode = this.data.inputValue;
        if (this.data.keyWord) datas.EqptCode = this.data.keyWord;
        if (this.data.SiteType) datas.SiteType = this.data.SiteType;
        if (this.data.tags) datas.tags = this.data.tags;
      }

      app
        .http(`/em/v1/eqpts/distance`, datas, "get")
        .then((res) => {
          wx.hideLoading();
          this.setData({ status: LOAD_STATUS.LOADMORE });

          res.data.forEach((item) => {
            item.kilometer = (item.juli / 1000).toFixed(2);
            if (item.tag) item.tagList = item.tag.split("|");
            if (item.actives.length > 2) item.actives.length = 2;

            if (
              (item.is_zy == 1 && item.Price && 10 > item.Price) ||
              (item.is_other == 1 && item.open_fill == 1) ||
              (!item.is_zy && !item.is_other)
            ) {
              item.notShowUrea = true;
            }

            let arr = item.oil_prices ? item.oil_prices.split(",") : [];
            item.oil_pricesList = this.setOilList(arr, 3);

            item.commodityList = item.commoditys
              ? JSON.parse(item.commoditys).filter((item1) => item1.stock)
              : [];

            let count = item.Price > 10 ? 3 : 2;
            if (item.commodityList.length > count) {
              item.commodityList.length = count;
            }
          });

          this.setData({
            listData: [...this.data.listData, ...res.data],
          });

          if (this.data.listData.length >= res.count) {
            this.setData({ status: LOAD_STATUS.NOMORE });
          } else {
            this.setData({ page_number: this.data.page_number + 1 });
          }
          resolve();
        })
        .catch(() => {
          wx.hideLoading();
          this.setData({ status: LOAD_STATUS.LOADMORE });
          reject();
        });
    });
  },

  // 获取柴油列表
  getDieselList() {
    return new Promise((resolve, reject) => {
      if ([LOAD_STATUS.NOMORE, LOAD_STATUS.LOADING].includes(this.data.status)) {
        return resolve();
      }

      const { getLocation, page_number } = this.data;
      if (!getLocation || !getLocation.longitude || !getLocation.latitude) {
        console.warn("未获取到定位信息");
        this.setData({ status: LOAD_STATUS.NOMORE });
        return resolve();
      }

      wx.showLoading({ title: "加载中...", mask: true });
      this.setData({ status: LOAD_STATUS.LOADING });
      const params = {
        pageNum: page_number,
        pageSize: 20,
        longitude: getLocation.longitude,
        latitude: getLocation.latitude,
        oilGrade: this.data.oilTexts,
        keyword: this.data.inputValue,
      };

      // ✅ 修复：使用 sadminHttp + 相对路径 + 15秒超时
      app
        .sadminHttp("/api/gasStation/nearby", params, "POST", null, 15000)
        .then((res) => {
          wx.hideLoading();
          this.setData({ status: LOAD_STATUS.LOADMORE });

          if (!res.data || !Array.isArray(res.data.list)) {
            this.setData({ status: LOAD_STATUS.NOMORE });
            return resolve();
          }

          const newList = res.data.list.map((item) => ({
            ...item,
            kilometer: (item.distance / 1000).toFixed(2),
            EqptCode: item.name,
            address: item.address || "暂无地址",
          }));

          this.setData({
            listData: [...this.data.listData, ...newList],
          });

          if (this.data.listData.length >= res.data.total) {
            this.setData({ status: LOAD_STATUS.NOMORE });
          } else {
            this.setData({ page_number: page_number + 1 });
          }
          resolve();
        })
        .catch((err) => { 
          wx.hideLoading();
          console.error("柴油列表请求失败:", err);
          wx.showToast({ title: "加载失败，请重试", icon: "none" });
          this.setData({ status: LOAD_STATUS.LOADMORE });
          reject(err);
        });
    });
  },

  // 统一加载入口（带防重）
  getList() {
    if (
      this.data.isFetching ||
      [LOAD_STATUS.NOMORE, LOAD_STATUS.LOADING].includes(this.data.status)
    ) {
      return;
    }

    this.setData({ isFetching: true });
    if (this.data.headTable == 0) {
      this.getUreaList().finally(() => {
        this.setData({ isFetching: false });
      });
    } else if (this.data.headTable == 1) {
      this.getDieselList().finally(() => {
        this.setData({ isFetching: false });
      });
    }
  },

  setOilList(arr, num = 2) {
    let arr1 = [],
      arr2 = [];
    arr.forEach((item1) => {
      arr1.push({
        name: item1.split("|")[0],
        price: item1.split("|")[1],
      });
    });
    for (var i = 0; i < arr1.length; i += num) {
      arr2.push(arr1.slice(i, i + num));
    }
    return arr2;
  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    await app.loginFun();
    const { data: configsData } = await app.http(
      `/em/v1/configs/36`,
      "",
      "get",
    );
    this.setData({ configsData: configsData });
    let userInfo = wx.getStorageSync("userInfo");
    let setBatchCreate = wx.getStorageSync("setBatchCreate");
    let channel = wx.getStorageSync("channel");

    if (
      channel == "huochebao" &&
      configsData.value == 1 &&
      userInfo &&
      !setBatchCreate
    ) {
      this.setData({ preferentialShow: true });
    }
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
  onPullDownRefresh: function () {
    this.resetList().finally(() => {
      wx.stopPullDownRefresh();
    });
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.safeLoadList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log(res);
    if (res.from === "button") {
      console.log(res.target);
    }
    return {
      title: "您的附近加注站点",
      path: "/pages/site/site",
      imageUrl:
        "https://admin-ejiablue-com.oss-cn-shenzhen.aliyuncs.com/Applet/wx9816c7566b7fde8f/site/site_share_poster.jpg",
    };
  },

  // 子组件事件处理
  onItemClick(e) {
    const item = e.detail.item;
    this.goPage({ currentTarget: { dataset: { item: item } } });
  },
  onItemClickDiese(e) {
    const item = e.detail.item;
    console.log(item, "------item");
    wx.navigateTo({
      url: `/pages/site/dieselInfo/dieselInfo?stationId=${item.stationId}`,
    });
  },
  onNavigateTap(e) {
    const item = e.detail.item;
    this.getLocationTwos({ currentTarget: { dataset: { item: item } } });
  },

  onDetailTap(e) {
    const item = e.detail.item;
    this.goPage({ currentTarget: { dataset: { item: item } } });
  },
});
