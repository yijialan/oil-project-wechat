var app = getApp();

Page({
  data: {
    userInfo: {
      nickName: "",
      mobile: "",
      level: "",
      levelText: "",
      score: 0,
      memberId: "",
      avatarUrl: "",
      regDate: "",
      oilAmount: "0.00",
      adblueAmount: "0.00",
      cardAmount: "0.00",
    },
  },
  onShow: async function () {
    await app.loginFun();
    const userInfo = wx.getStorageSync("userInfo") || {};
    const avatarFromProfile = userInfo.userInfo && userInfo.userInfo.avatarUrl;
    const regDate = userInfo.memberRegDate
      ? this.formatDate(userInfo.memberRegDate)
      : "";
    const normalizedInfo = {
      nickName:
        (userInfo.userInfo && userInfo.userInfo.nickName) ||
        userInfo.memberName ||
        "",
      mobile: userInfo.memberMobile || "",
      level: userInfo.level || "",
      levelText: this.getLevelText(userInfo.level),
      score: userInfo.score || 0,
      memberId: userInfo.memberId || "",
      avatarUrl: avatarFromProfile || userInfo.memberHeadimg || "",
      regDate,
      oilAmount: userInfo.oilAmount || "0.00",
      adblueAmount: userInfo.adblueAmount || "0.00",
      cardAmount: userInfo.card_amount || "0.00",
    };
    this.setData({ userInfo: normalizedInfo });
    this.initTabbar();
  },
  formatDate(timestamp) {
    const milliseconds = Number(timestamp) * 1000;
    const date = new Date(milliseconds);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },
  getLevelText(level) {
    switch (Number(level)) {
      case 0:
        return "普通会员";
      case 1:
        return "银卡会员";
      case 2:
        return "金卡会员";
      case 3:
        return "铂金会员";
      case 4:
        return "钻石会员";
      default:
        return "未知";
    }
  },
  initTabbar() {
    const template = require("../tabbar/tabbar.js");
    template.tabbar("tabBar", 1, this);
  },
});
