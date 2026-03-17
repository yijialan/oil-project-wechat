//app.js
import moment from "moment";
import Dialog from "@vant/weapp/dialog/dialog";
import { headersFun } from "./utils/yztRequestUtils";


let httpsArrs=['https://api.ejiablue.com',  'https://api-sadmin.ejiablue.com']
App({

    //全局API地址
    Domain: "https://api.ejiablue.com",
    //Domain: 'https://faliteshop.217dan.com',
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: "Bearer 1c7e9e17a69aa92c383742c7527814912b3e467d",
    },
    render() {
        console.log("objectobjectobjectobject");
        return `<view>123</view>`;
    },
    api_url: "",
    /* 设置api地址 */
    setApiUrl: function() {
        this.api_url = this.Domain + "/";
    },
    // 设置监听器
    watch: function(ctx, obj) {
        Object.keys(obj).forEach((key) => {
            this.observer(ctx.data, key, ctx.data[key], function(value) {
                obj[key].call(ctx, value);
            });
        });
    },
    // 设置data对象里的对象监听器
    watchObj: function(ctx, obj) {
        Object.keys(obj).forEach((key) => {
            this.observer(ctx, key, ctx[key], function(value) {
                obj[key].call(ctx, value);
            });
        });
    },
    // 监听属性，并执行监听函数
    observer: function(data, key, val, fn) {
        Object.defineProperty(data, key, {
            configurable: true,
            enumerable: true,
            get: function() {
                return val;
            },
            set: function(newVal) {
                if (newVal === val) return;
                fn && fn(newVal);
                val = newVal;
            },
        });
    },

    http: function(url, data = "", method = "GET", headers, timeout = 30000,users=0) {
        //封装http请求
        const apiUrl = "https://api.ejiablue.com"; //请求域名
        // const apiUrl = 'http://tapi.ejiablue.com' //请求域名-长沙

        //console.log(this.globalData)
        const userInfo = wx.getStorageSync("userInfo");
        const currency = {
            openid: userInfo.openid,
        };
        // wx.showLoading({ title: "加载中" });
        return new Promise((resolve, reject) => {
            wx.request({
                url: apiUrl + url,
                data: Object.assign(data),
                method: method,
                header: headers || this.headers,
                timeout,
                success: function(res) {
                    // console.log('成功', res);
                    if (res.data.code == 0 && res.statusCode == 200) {
                        // console.log('成功的回调----', res);
                        resolve(res.data);
                    } else {
                        wx.showToast({
                            title: res.data.message, // 标题
                            icon: "none", // 图标类型，默认success
                            duration: 3000, // 提示窗停留时间，默认1500ms
                        });
                        resolve(res.data);
                    }
                    // wx.hideLoading();
                },
                fail: function(res) {
                    reject(res);
                },
                complete: function() {
                    // console.log('complete');
                },
            });
        });
    },

    // 云直通
    httpApi: function(url, data = "", method = "GET") {
        //封装http请求
        // console.log('signature', headersFun({ id: 123456 }))
        const apiUrl = "https://apiyzt.ejiablue.com"; //请求域名
        const userInfo = wx.getStorageSync("userInfo");
        let token = wx.getStorageSync("yztTokenData").accessToken;
        let contentType = "application/json; charset=utf-8";
        let Authorization = `Bearer ${
      token
        ? token
        : "YjY2YjM1NTctZDQzMy0xMWVkLTliMzctNmM5MmJmNWNhNjIyOmJjOWEyZGRjLWQ0MzMtMTFlZC05YjM3LTZjOTJiZjVjYTYyMg=="
    }`;
        if (url == "/oauth/v1/token") {
            contentType = "application/x-www-form-urlencoded";
            Authorization =
                "Basic YjY2YjM1NTctZDQzMy0xMWVkLTliMzctNmM5MmJmNWNhNjIyOmJjOWEyZGRjLWQ0MzMtMTFlZC05YjM3LTZjOTJiZjVjYTYyMg==";
        }
        return new Promise((resolve, reject) => {
            wx.request({
                url: apiUrl + url,
                data: Object.assign(data),
                method: method,
                header: {
                    ...headersFun(data),
                    ... {
                        "Content-Type": contentType,
                        Authorization: Authorization,
                    },
                },
                success: function(res) {
                    if (res.data.code == 0 || res.statusCode == 200) {
                        resolve(res.data);
                    } else if (res.data.code == 401 || res.statusCode == 401) {
                        wx.showToast({
                            title: "当前鉴权失败、用户信息获取失败", // 标题
                            icon: "none", // 图标类型，默认success
                            duration: 3000, // 提示窗停留时间，默认1500ms
                        });
                        setTimeout(() => {
                            wx.removeStorageSync("yztTokenData");
                            wx.reLaunch({
                                url: "/pages/site/site",
                            });
                        }, 2000);
                        resolve(res);
                    } else {
                        console.log("resresresresresres", res);
                        wx.showToast({
                            title: res.message, // 标题
                            icon: "none", // 图标类型，默认success
                            duration: 3000, // 提示窗停留时间，默认1500ms
                        });
                        resolve(res.data);
                    }
                    // wx.hideLoading();
                },
                fail: function(res) {
                    console.log("resresresresresres", res);
                    reject(res);
                },
                complete: function() {
                    // console.log('complete');
                },
            });
        });
    },
    sadminHttp: function(url, data = "", method = "GET", headers, timeout = 6000) {
        //封装http请求
        const apiUrl = "https://api-sadmin.ejiablue.com"; //请求域名
        // const apiUrl = "http://192.168.31.191:8080"; //请求域名

        // wx.showLoading({ title: "加载中" });
        return new Promise((resolve, reject) => {
            wx.request({
                url: apiUrl + url,
                data: Object.assign(data),
                method: method,
                header: headers || this.headers,
                timeout,
                success: function(res) {
                    if (res.data.code == 0 && res.statusCode == 200) {
                        resolve(res.data);
                    } else {
                        wx.showToast({
                            title: res.data.msg, // 标题
                            icon: "none", // 图标类型，默认success
                            duration: 3000, // 提示窗停留时间，默认1500ms
                        });
                        reject(res.data);
                    }
                },
                fail: function(res) {
                    reject(res);
                },
                complete: function() {
                },
            });
        });
    },
    // 判断用户是否登录
    // 进行跳转
    loginFun() {
        let userInfo = wx.getStorageSync("userInfo");
        let userPhone = wx.getStorageSync("userPhone");
        wx.removeStorageSync('urlWithArgs') // 清除路径缓存
            // if (!(userInfo && userPhone == "getPhoneNumber:ok")) {
            // if (!userInfo) {
        let pages = getCurrentPages(); //获取加载的页面
        let currentPage = pages[pages.length - 1]; //获取当前页面的对象
        let url = currentPage.route; //当前页面url
        let options = currentPage.options; //如果要获取url中所带的参数可以查看options
        //拼接url的参数
        let urlWithArgs = url + "?";
        for (var key in options) {
            let value = options[key];
            urlWithArgs += key + "=" + value + "&";
        }
        urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);
        // 跳转到 login之前储存本级页面url+参数
        wx.setStorageSync("urlWithArgs", urlWithArgs);
        return false;
        // }
    },
    // 全局扫码方法
    resultFun(result) {
        if (result.scanType == "WX_CODE") {
            if (result.path) {
                let url = result.path;
                wx.redirectTo({
                    url: "/" + url,
                });
            } else {
                Dialog.alert({
                    title: "提示",
                    message: "该二维码不支持，请确认是否为加注码",
                });
            }
        }
        if (result.scanType == "QR_CODE") {
            if (
                result.result.indexOf(
                    "/pay.ejiablue.com/index.php/index/pay_self/index/number/"
                ) !== -1
            ) {
                let arr = result.result.split("/");
                let id = arr[arr.length - 1];
                let data = {
                    Number: id,
                    page_size: 10,
                    page_number: 1,
                };
                console.log(id);
                /**
                 * 判断是否为payjs支付，还是普通支付
                 * is_other 不等于1 is_zy 不等于1，且mch_key 有值，则为payjs支付
                 */
                this.http("/em/v1/eqpts", data, "get").then((res) => {
                    let eqpt = res.data[0];
                    if (
                        eqpt.is_other !== 1 &&
                        eqpt.is_zy !== 1 &&
                        eqpt.org.mch_key &&
                        eqpt.org.wxid
                    ) {
                        Dialog.alert({
                            title: "提示",
                            message: "请打开微信扫一扫进行加注",
                        });
                    } else {
                        wx.redirectTo({
                            url: "/pages/payment/payment?id=" + id,
                        });
                    }
                    console.log(res.data[0]);
                });
                return;
            } else if (result.result.indexOf("//wx.ejiablue.com/wxxcx/") !== -1) {
				let id = result.result.split("?id=");
				let service_acc_id = result.result.split("?service_acc_id=");
				console.log(id);
				console.log(service_acc_id,'service_acc_id')
               if(id[1]){
				this.http(`/os/v1/users/${id[1]}`, "", "GET").then((res) => {
                    if(res.data.eqpt&&res.data.eqpt.is_hx_station==1){
                        wx.redirectTo({
                            url:"/highSpeedVerification/home/home"
                        });
                    }else{
                        wx.redirectTo({
                            url: '/osFillingModule/osFillingMain/osFillingMain?id=' + id[1],
                        })
                    }
                });
			   } else if(service_acc_id[1]){
				wx.redirectTo({
					url: '/freightTransport/authPage/allIdentityAuth/allIdentityAuth?service_acc_id=' + service_acc_id[1],
				})
			   }
            } else if (
                result.result.indexOf("//wx.ejiablue.com/2021/chuzhika.html") !== -1
            ) {
                // 储值卡充值码
                Dialog.confirm({
                    title: "提示",
                    message: "该二维码属于储值卡充值二维码",
                }).then(() => {
                    let kahao = result.result.split("?kahao=");
                    wx.navigateTo({
                        url: "/pages/chuzhika/chuzhika?kahao=" + kahao[1],
                    });
                });
            } else {
                Dialog.alert({
                    title: "提示",
                    message: "该二维码不支持，请确认是否为加注码",
                });
            }
        }
    },

    showError: function(
        msg,
        callback,
        title = "温馨提示",
        confirmText = "确定"
    ) {
        wx.showModal({
            title,
            content: msg,
            showCancel: false,
            confirmText,
            success: function(res) {
                callback && callback();
            },
        });
	},
	
	showToastFn(msg,callback,icon,duration=2000){
		wx.showToast({
		  title: msg,
		  duration,
		  icon,
		  mask: true
		})
		setTimeout(()=>{
			callback && callback();
		},duration?duration-300:0)
	},
    showSuccess: function(msg, callback) {
        wx.showModal({
            title: "温馨提示",
            content: msg,
            showCancel: false,
            success: function(res) {
                callback && callback();
            },
        });
    },
    successToast: function(title, icon = "success", duration = "1500") {
        wx.showToast({
            title,
            icon,
            duration,
        });
    },
    setGlobalData(key, value) {
        this.globalData[key] = value;
        wx.setStorageSync("os_" + key, value);
    },
    removeGlobalData() {
        let globalDataArr = [{
                key: "userData",
                value: "",
            },
            {
                key: "sessionData",
                value: {},
            },
            {
                key: "luckyDrawStr",
                value: "",
            },
            {
                key: "cardsData",
                value: [],
            },
            {
                key: "selectedCard",
                value: {},
            },
            {
                key: "employeeData",
                value: {},
            },
            {
                key: "commoditysData",
                value: [],
            },
            {
                key: "commoditysData",
                value: {},
            },
            {
                key: "tokenData",
                value: {},
            },
            {
                key: "activityID",
                value: "",
            },
            {
                key: "currentEqpt",
                value: {},
            },
        ];
        globalDataArr.forEach((item) => {
            this.globalData[item.key] = item.value;
            if (!["tokenData"].includes(item.key)) {
                wx.removeStorageSync("os_" + item.key);
            }
        });
    },

    onLaunch() {
        this.clearGlobalData();
        this.setApiUrl();
        wx.setStorageSync("isLogin", false);
    },

    clearGlobalData() {
        wx.removeStorageSync("osFill_id");
        this.removeGlobalData();
    },

    globalData: {
        userInfo: null,
        openid: null,
        session_key: null,
        statusBarHeight: wx.getSystemInfoSync()["statusBarHeight"] + 44,
        commoditysData: wx.getStorageSync("os_commoditysData") || [],
        employeeData: wx.getStorageSync("os_employeeData") || {},
        userData: wx.getStorageSync("os_userData") || {}, //优选加注用户
        sessionData: wx.getStorageSync("os_sessionData") || {},
        luckyDrawStr: wx.getStorageSync("os_luckyDrawStr") || "",
        cardsData: wx.getStorageSync("os_cardsData") || [],
        selectedCard: wx.getStorageSync("os_selectedCard") || {},
        userProfile: wx.getStorageSync("os_userProfile") || {},
        tokenData: wx.getStorageSync("os_tokenData") || {},
        activityID: wx.getStorageSync("os_activityID") || "",
		currentEqpt: wx.getStorageSync("os_currentEqpt") || {},
		historyAddress: [],
		freightFrom: {
			//goodVal: '小余生产机,散装,1吨,1方',
			goodData: {},
			// carVal: [[{title: "整车", value: "0", checkd: true}],[{title: "1.8", value: "1.8", checkd: true, unit: "米",},{title: "2.7", value: "2.7", checkd: true, unit: "米",},{title: "3.8", value: "3.8", checkd: true, unit: "米",}],[{title: "平板", value: "平板", checkd: true},{title: "高栏", value: "高栏", checkd: true},{title: "爬梯车", value: "爬梯车", checkd: true}]],
			// timeVal: [{text: "今天",timeStr: moment().format("MM-DD")},{text: "全天都可以00:00-24:00", time: 99, id: 1}],
			goodVal: '',
			carVal: [],
			priceVal: '',
			remarkVal: '',
			type: '1', //今日用车 1；预约发货 2
			priceType: 1, //价格标签，1-议价，2-一口价
			dressList: [{}],
			unloadList: [{}],
			// unloadList: [{title: "望城区恒都苑南(雷锋东路)", addr: "湖南省长沙市望城区雷锋东路25号(高塘岭镇雷锋东路)", addressData: [{code: "430000", name: "湖南省"}, {code: "430100", name: "长沙市"},{code: "430112", name: "望城区"}]},{title: "藁城看香", addr: "河北省石家庄市藁城区利芳商店东南侧180米", detailedAddress: "111", addressData: [{code: "130000", name: "河北省"},{code: "130100", name: "石家庄市"},{code: "130102", name: "长安区"}]}],
			// dressList: [{title: "望城区恒都苑南(雷锋东路)", addr: "湖南省长沙市望城区雷锋东路25号(高塘岭镇雷锋东路)", addressData: [{code: "430000", name: "湖南省"}, {code: "430100", name: "长沙市"},{code: "430112", name: "望城区"}]}],
		}
    },
});