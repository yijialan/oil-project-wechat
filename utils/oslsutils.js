/*获取司机id*/
function getDriversId() {
    let driversId = wx.getStorageSync("driversId");
    return driversId
}
/*添加司机id*/
function setDriversId(id) {
    wx.setStorageSync("driversId", id);
}
/*删除司机id*/
function removeDriversId() {
    wx.removeStorageSync("driversId");
}


//  经纬度相关
function getLocationFun() {
    return new Promise((resolve, reject) => {
        wx.getLocation({
            type: 'gcj02', //返回可以用于uni.openLocation的经纬度
            success: function(res) {
                // console.log('getLocation', res)
                const latitude = res.latitude;
                const longitude = res.longitude;
                resolve({
                    latitude: latitude,
                    longitude: longitude,
                })
            },
            fail(res) { //用户拒绝后引导用户开启定位
                getSetting();
                console.log('fail', res)
            }
        });
    })
}
// 1.获取设置信息-用户权限列表
function getSetting() {
    wx.getSetting({
        success: res => {
            if (res.authSetting['scope.userLocation']) { // 选择位置信息
                getLocationFun() // 重新调取uni.getLocation
            } else {
                //2.用户第一次进来发起授权
                wx.showModal({
                    title: '提示',
                    content: '当前定位未开启，请点击确定手动开启定位',
                    duration: 3000,
                    success: (res) => {
                        if (res.confirm) {
                            openSetting() //点击确定引导客户开启定位
                        } else if (res.cancel) {
                            wx.showToast({
                                title: '你拒绝了授权，无法获取门店定位信息',
                                duration: 2000,
                                icon: "none"
                            });
                        }
                    }
                });
            }
        }
    })
}
// 4.打开设置
function openSetting() {
    wx.openSetting({
        success: (res) => {
            if (res.authSetting['scope.userLocation']) {
                getLocationFun()
            } else {
                wx.showToast({
                    title: '你拒绝了授权，无法操作内容',
                    icon: "none",
                    duration: 3000,
                })
            }
        },
        fail: (err) => {
            console.log("打开设置失败", err)
        }
    })
}

export { getDriversId, setDriversId, removeDriversId, getLocationFun }