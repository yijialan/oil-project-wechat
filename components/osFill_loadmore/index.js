// fleetModule/fleet_components/fleet_loadmore/index.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        status:{
            type: String,
            value: 'loadmore'
        }
        
    },
    observers: {
        'status': function(val) {
            this.setData({loadingStatus: val})
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        loadingStatus: ''
    },

    /**
     * 组件的方法列表
     */
    methods: {

    }
})
