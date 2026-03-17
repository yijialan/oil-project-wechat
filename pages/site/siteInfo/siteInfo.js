var app = getApp();
import Dialog from "@vant/weapp/dialog/dialog";
Page({
    /**
     * 页面的初始数据
     */
    data: {
        sitePic: [
            "https://admin-ejiablue-com.oss-cn-shenzhen.aliyuncs.com/Applet/wx9816c7566b7fde8f/20220328111817_1648437559376.jpg",
            "https://admin-ejiablue-com.oss-cn-shenzhen.aliyuncs.com/Applet/wx9816c7566b7fde8f/20220328111817_1648437559376.jpg",
            "https://admin-ejiablue-com.oss-cn-shenzhen.aliyuncs.com/Applet/wx9816c7566b7fde8f/20220328111817_1648437559376.jpg"
        ],
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
        label: ["洗手间", "便利店", "休息室"],
        // 公司信息
        company: {
            name: "湖南壹加蓝信息技术有限公司",
            phone: "136-8564-8836",
            car: "停车免费",
        },
    },

    //预览轮播图片
    previewImage: function(e) {
        var current = e.target.dataset.src;
        wx.previewImage({
            current: current,
            // 当前显示图片的http链接
            urls: this.data.sitePic,
            // 需要预览的图片http链接列表
        });
    },

    // 扫码加注
    jiazhu: function() {
        wx.scanCode({
            onlyFromCamera: true,
            scanType: [],
            success: (result) => {
                app.resultFun(result)
            },
            fail: (res) => {},
            complete: (res) => {},
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // is_other
        console.log(options.id);
        this.address(options.id);
    },
    lan() {
        let Data = this.data.siteInfoData;
        wx.openLocation({
            //​使用微信内置地图查看位置。
            longitude: Data.Longitude, //要去的经度-地址
            latitude: Data.Latitude, //要去的纬度-地址
            name: Data.EqptCode, //导航名称
            address: Data.address, //地址
        });
    },
    // 获取地址详情
    address(id) {
        app.http(`/em/v1/eqpts/${id}`, "", "GET").then((res) => {
            this.setData({
                siteInfoData: res.data,
            });
            console.log(this.data.siteInfoData);
            this.Ordes(res.data.OrgId);
        });
    },
    Ordes(OId) {
        let that = this;
        app.http("/em/v1/orgs/" + OId, "", "GET").then((res) => {
            that.data.company = {
                name: res.data.Name,
                phone: res.data.Phone || res.data.MainTainPhone,
                car: "停车免费",
            };
            that.setData({
                company: that.data.company,
            });
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        app.loginFun()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {},
});