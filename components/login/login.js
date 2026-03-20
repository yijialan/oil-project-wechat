const { default: tool } = require("../../utils/tool");

var app = getApp();
var canRegister = true;
Component({
    properties: {
        eqptNumber: {
            type: String,
            value: "",
        },
    },
    data: {
        title: "用户协议",
        desc1: "感谢您使用本小程序，您使用前应当阅读并同意",
        urlTitle: "",
        desc2: "当您点击同意并开始时用产品服务时，即表示你已理解并同息该条款内容，该条款将对您产生法律约束力。",
        innerShow: false,
        height: 0,
        showPrivacy: false,
        phoneInfo: {},
        sessionData: {},
        hasUserInfo: false, // 判断完全登录(有手机号)
        disagreeTitle: "不同意并返回首页",
        isClick: false, //避免接口返回慢误触
        isDisagree: false,
        pageList: ["pages/site/site", "pages/site/siteInfo/siteInfo", "pages/site/tripartiteInfo/tripartiteInfo"],
    },
    lifetimes: {
        attached: async function() {
            const { pageList } = this.data;
            let pages = getCurrentPages(); //获取加载的页面
            let currentPage = pages[pages.length - 1]; //获取当前页面的对象
            let url = currentPage.route; //当前页面url
            let userInfo = wx.getStorageSync("userInfo");

            if (pageList.includes(url)) this.setData({ disagreeTitle: "关闭弹窗" });

            const needPrivacy = await this.checkPrivacySetting();
            if (needPrivacy) return;

            const hasUserInfo = !tool.isEmpty(userInfo);
            if (hasUserInfo && userInfo.memberMobile) {
                this.setData({
                    hasUserInfo: true,
                    phoneInfo: { purePhoneNumber: userInfo.memberMobile },
                });
                if (pageList.includes(url)) {
                    this.triggerEvent("refresh", true);
                }
                return;
            }

            this.getLoginInfo();
        },
    },
    methods: {
        getCurrentRoute() {
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            return currentPage ? currentPage.route : "";
        },
        checkPrivacySetting() {
            if (!wx.getPrivacySetting) return Promise.resolve(false);

            return new Promise((resolve) => {
                wx.getPrivacySetting({
                    success: (res) => {
                        if (res.needAuthorization) {
                            const currentRoute = this.getCurrentRoute();
                            const isNoPopupPage = this.data.pageList.includes(currentRoute);
                            this.setData({
                                urlTitle: res.privacyContractName,
                                showPrivacy: true,
                            });
                            if (!isNoPopupPage) {
                                this.popUp();
                                resolve(true);
                                return;
                            }
                        }
                        resolve(false);
                    },
                    fail: () => resolve(false),
                });
            });
        },
        async getLoginInfo() {
            const loginInfo = await this.getWeixinLoginInfo();
            const sessionInfo = await app.http(`/os/v1/users/sessionkey/${loginInfo.code}?type=5`, "", "get");
            const userDataRes = await app.http(
                `/em/v1/users`,
                {
                    unionid: sessionInfo.data.unionid,
                    memberWeixin: sessionInfo.data.openid,
                    page_size: 1,
                    page_number: 1,
                },
                "get"
            );

            const currentRoute = this.getCurrentRoute();
            const isNoPopupPage = this.data.pageList.includes(currentRoute);

            this.setData({ sessionData: sessionInfo.data, isClick: true });

            if (userDataRes.count > 0) {
                const appUserData = userDataRes.data[0];
                const userInfos = {
                    ...sessionInfo.data,
                    ...appUserData,
                    userInfo: {
                        nickName: appUserData.memberName,
                        avatarUrl: appUserData.memberHeadimg,
                    },
                };

                wx.setStorageSync("userInfo", userInfos);
                this.setData({
                    hasUserInfo: !!appUserData.memberMobile,
                    phoneInfo: { purePhoneNumber: appUserData.memberMobile || "" },
                });

                if (!appUserData.memberMobile) {
                    if (!isNoPopupPage) {
                        this.popUp();
                    }
                } else {
                    this.disPopUp();
                    this.triggerEvent("refresh", true);
                }

                this.triggerEvent("canRefresh", true);
                return;
            }

            wx.setStorageSync("is_newUser", true);
            if (!isNoPopupPage) {
                this.popUp();
            }
        },
        // 获取登录信息
        getWeixinLoginInfo() {
            return new Promise((resolve) => {
                wx.login({
                    success: function(res) {
                        console.log("获取登录信息");
                        console.log(res);
                        resolve(res);
                    },
                    fail: function(error) {
                        reject(error);
                    },
                });
            });
        },
        // 获取手机号
        async getPhoneNumber(e) {
            const { sessionData, pageList } = this.data;
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            const url = currentPage.route;

            if (e.detail.errMsg === "getPhoneNumber:ok" && e.detail.encryptedData) {
                const phoneInfo = await app.http(
                    "/os/v1/users/decryptuserinfo",
                    {
                        encrypted_data: e.detail.encryptedData,
                        iv: e.detail.iv,
                        session_key: sessionData.session_key,
                    },
                    "POST"
                );
                this.setData({ phoneInfo: phoneInfo.data });
                if (canRegister) {
                    canRegister = false;
                    this.registerUser();
                }
                return;
            }

            if (pageList.includes(url)) {
                this.disPopUp();
                this.registerUser();
                return;
            }
            app.showError("为了更好地为您提供服务,请同意下方授权");
        },
        async registerUser() {
            // 分享者携带id
            let getReferee = wx.getStorageSync("referee_share_id");
            let rg_active_id = wx.getStorageSync("rg_active_id");
            let Syncshops_id = wx.getStorageSync("storage_shops_id");

            let hxorgid = wx.getStorageSync("hxorgid");

            let userInfo = wx.getStorageSync("userInfo");
            let res = {};
            let pages = getCurrentPages(); //获取加载的页面
            let currentPage = pages[pages.length - 1]; //获取当前页面的对象
            let url = currentPage.route; //当前页面url

            if (this.data.eqptNumber) {
                res = await this.getEqptsFun();
            }
            const channel = wx.getStorageSync("channel");
            console.log('channel',channel)
            // return
            let registerInfo = await app.http(
              "/em/v1/users",
              {
                memberMobile: this.data.phoneInfo.purePhoneNumber,
                memberName: this.data.hasUserInfo ? userInfo.userInfo.nickName : "微信用户",
                memberSex: this.data.hasUserInfo ? userInfo.memberSex : "",
                memberHeadimg: this.data.hasUserInfo ? userInfo.userInfo.avatarUrl : "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
                memberWeixin: this.data.sessionData.openid,
                unionid: this.data.sessionData.unionid,
                eqpt_id: res.EqptId ? res.EqptId : "",
                is_lock: 1,
                OrgId: res.OrgId ? res.OrgId : hxorgid ? 818 : rg_active_id ? 564 : 431, //组织id 通过二维码推荐过来的 就显示推荐人的组织id 或 直接进来的就是默认的431
                level: 1,
                score: 0,
                referee: getReferee || 0,
                rg_active_id: rg_active_id || 0,
                source: Syncshops_id ? `会员商城小程序` : `${channel ? "会员中心小程序_" + channel : "会员中心小程序"}`, // 商铺id
                channel_id: Syncshops_id ? Syncshops_id : undefined,
              },
              "POST"
            );

            let userInfos = {
                ...this.data.sessionData,
                ...registerInfo.data,
                userInfo: {
                    nickName: registerInfo.data.memberName,
                    avatarUrl: registerInfo.data.memberHeadimg,
                },
            }; //用户登录信息和用户的sekey 进行合并 原因：少用一个缓存

            wx.setStorageSync("userInfo", userInfos);

            const urlWithArgs = wx.getStorageSync("urlWithArgs");

            canRegister = true;

            if (!this.data.hasUserInfo) {
                this.disPopUp();
                if (this.data.pageList.includes(url)) {
                    this.triggerEvent("refresh", true); //提醒父组件需要刷新
                    return;
                }
                if (this.data.isDisagree) return wx.reLaunch({ url: "/pages/site/site" });
                if (!urlWithArgs) {
                    wx.reLaunch({ url: "/pages/site/site" });
                    return;
                }
                const targetUrl = urlWithArgs.replace(/^\//, "");
                if (targetUrl === url) {
                    this.triggerEvent("refresh", true);
                    return;
                }
                wx.redirectTo({ url: "/" + urlWithArgs });
            }
        },
        handleDisagree() {
            let pages = getCurrentPages(); //获取加载的页面
            let currentPage = pages[pages.length - 1]; //获取当前页面的对象
            let url = currentPage.route; //当前页面url

            let userInfo = wx.getStorageSync("userInfo");

            this.setData({ isDisagree: true });

            console.log(url);

            if (!this.data.hasUserInfo) {
                this.setData({
                    phoneInfo: { purePhoneNumber: userInfo.memberMobile || "" },
                });
                this.registerUser();
                return;
            }

            if (this.data.pageList.includes(url)) {
                this.triggerEvent("refresh", true); //提醒父组件需要刷新
                this.disPopUp();
                return;
            } else {
                wx.reLaunch({
                    url: "/pages/site/site",
                });
            }
        },
        handleAgree() {},
        popUp() {
            this.setData({ innerShow: true });
        },
        disPopUp() {
            this.setData({
                innerShow: false,
            });
        },
        openPrivacyContract() {
            wx.openPrivacyContract({
                success: () => {},
                fail: () => {},
            });
        },
        // 协议跳转
        registerFun() {
            wx.navigateTo({
                url: "/pages/register/register",
            });
        },
        //协议跳转
        PrivacyFun() {
            wx.navigateTo({
                url: "/pages/privacy/privacy",
            });
        },
        // 获取设备信息
        getEqptsFun() {
            return new Promise((resolve) => {
                let data = {
                    Number: this.data.eqptNumber,
                    page_size: 10,
                    page_number: 1,
                };
                app.http("/em/v1/eqpts", data, "get").then((res) => {
                    if (res.data[0]) {
                        resolve(res.data[0]);
                    } else {
                        resolve(431);
                    }
                });
            });
        },

        handleAgreePrivacyAuthorization() {
            this.setData({ showPrivacy: false });
            this.disPopUp();
            this.getLoginInfo();
        },
    },
});