// pages/components/siteListItem/siteListItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    itemData: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法
   */
  methods: {
    // 点击项目 - 进入详情页
    onItemClick(e) {
      // 触发自定义事件，将数据传递给父组件
      this.triggerEvent('itemclick', { 
        item: this.data.itemData 
      });
    },
    
    // 点击导航按钮
    onNavigateClick(e) {
      // 由于使用的是 catchtap，不需要再调用 stopPropagation
      // 触发导航事件，将数据传递给父组件
      this.triggerEvent('navigatetap', { 
        item: this.data.itemData 
      });
    },
    
    // 点击查看详情
    onViewDetail(e) {
      // 触发查看详情事件，将数据传递给父组件
      this.triggerEvent('detailtap', { 
        item: this.data.itemData 
      });
    }
  }
})