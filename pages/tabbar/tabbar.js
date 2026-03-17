function tabbarinit() {
    return [
        {
            current: 0,
            pagePath: "/pages/site/site",
            iconPath: "/image/site.png",
            selectedIconPath: "/image/site_act.png",
            text: "站点",
        },
        {
            current: 0,
            pagePath: "/pages/user/user",
            iconPath: "/image/user.png",
            selectedIconPath: "/image/user_act.png",
            text: "我的",
        },
    ];
}
//tabbar 主入口
function tabbarmain(bindName = "tabdata", id, target) {
    var that = target;
    var bindData = {};
    var otabbar = tabbarinit();
    otabbar[id]["iconPath"] = otabbar[id]["selectedIconPath"];
    otabbar[id]["current"] = 1;
    bindData[bindName] = otabbar;
    that.setData({ bindData });
    console.log("----------------", id);
    // if (id == 2) {
    //     wx.navigateToMiniProgram({
    //         appId: "wx2363a341a69365ef",
    //         path: "pages/site/site",
    //         extraData: {
    //             foo: "bar",
    //         },
    //         envVersion: "release",
    //         success(res) {
    //             console.log("打开成功", res);
    //             wx.redirectTo({
    //                 url: "/pages/site/site",
    //             });

    //         },
    //         fail(res) {
    //             console.log("打开失败", res);
    //             wx.redirectTo({
    //                 url: "/pages/site/site",
    //             });
    //         },
    //     });
    // }
}
module.exports = {
    tabbar: tabbarmain,
};