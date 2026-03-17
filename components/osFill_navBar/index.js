// fleetModule/fleet_components/fleet_navBar/index.js
Component({
    options:{
        styleIsolation:'apply-shared'
    },
    /**
     * 组件的属性列表
     */
    properties: {
        title: {
            type: String,
            value: ''
        },
        leftShow: {
            type: Boolean,
            value: false
        },
        border: {
            type: Boolean,
            value: false
        },
        placeholder: {
            type: Boolean,
            value: false
        },
        customClass: {
            type: Boolean,
            value: false
        },
        changeTitleClass: {
            type: Boolean,
            value: true
        },
        fixed: {
            type: Boolean,
            value: true
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },


    /**
     * 组件的方法列表
     */
    methods: {
        backFn() {
            let pages = getCurrentPages(); // 当前页面
            let beforePage = pages[pages.length - 2]; // 上一页
            if (beforePage) {
                wx.navigateBack({
                    delta: 1
                })
            } else {
                wx.reLaunch({
                    url: '/pages/index/index',
                })
            }
            
        },
        goHome() {
            wx.reLaunch({
                url: '/pages/index/index',
            })
        }
    }
})