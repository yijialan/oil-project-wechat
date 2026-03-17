// pages/components/siteHeads/siteHeads.js
var app = getApp();

Component({
  // 改为 Component 而不是 Page
  /**
   * 组件的属性列表
   */
  properties: {
    tableList: { type: Array, value: [] },
    headTable: { type: [Number, String], value: 0 },
    optionList: { type: Array, value: [] }, // 👈 新增
  },
  observers: {
    optionList(newVal) {
      // 深拷贝，避免直接修改 props
      this.setData({
        localOptionList: JSON.parse(JSON.stringify(newVal)),
      });
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    localOptionList: [], // 用于操作的本地副本
    statusBarHeight: app.globalData.statusBarHeight,
    currentIndex: 0,
    tops: 0,
    SelseIndex: "", // 初始化为0，而不是undefined
    tabseleList: [
      { title: "92#", id: 0 },
      { title: "95#", id: 1 },
      { title: "98#", id: 2 },
      { title: "0#", id: 3 },
    ],
    isPanelVisible: false, // 控制面板显示隐藏
    searchInputValue: "", // 搜索框的值
  },
  // ready() {
  //   console.log('=====================================headTable 值:', this.data.headTable);
  //   console.log('headTable 类型:', typeof this.data.headTable);
  // },
  /**
   * 组件生命周期函数
   */
  lifetimes: {
    attached() {
      console.log("组件被添加到页面");
      // 组件被添加到页面时执行
      setTimeout(() => {
        this.getSiteHeadsPropPosition();
      }, 500);
    },

    ready() {
      console.log("组件渲染完成");

      // 组件渲染完成后执行
      setTimeout(() => {
        this.getSiteHeadsPropPosition();
      }, 100);
    },

    detached() {
      // 组件从页面移除时执行
    },
  },

  /**
   * 组件所在页面的生命周期函数
   */
  pageLifetimes: {
    show() {
      this.setData({
        currentIndex: this.data.headTable,
      });
      // 页面显示时执行
      setTimeout(() => {
        this.getSiteHeadsPropPosition();
      }, 500);
    },

    hide() {
      console.log("组件所在页面隐藏");
    },

    resize(size) {
      console.log("页面尺寸变化", size);
    },
  },

  methods: {
    handleOptionTagClick(e) {

      console.log('点击事件1111')
      const { item, index, idx } = e.currentTarget.dataset;
      const list = this.data.localOptionList;

      if (list[index].multiple) {
        // 多选
        list[index].list[idx].checkd = !item.checkd;
      } else {
        // 单选：先取消同组其他项
        list[index].list.forEach((it, i) => {
          it.checkd = i === idx;
        });
      }

      this.setData({ localOptionList: list });
    },
    handleResetClick() {
      // 1. 清空搜索框和油号选择
      this.setData({
        searchInputValue: '',
        SelseIndex: '',

      });

      // 2. 重置筛选项
      const resetList = this.data.optionList.map(group => {
        const newGroup = { ...group, list: [...group.list] };
        newGroup.list.forEach((item, i) => {
          item.checkd = (!group.multiple && i === 0);
        });
        return newGroup;
      });

      // 3. 更新本地副本
      this.setData({ localOptionList: resetList });

      // 👇 关键：通知父组件“已重置”
      // this.triggerEvent('search', {
      //   keyword: '', // 清空关键词
      //   filters: this.getSelectedFilters() // 传回重置后的筛选值（全为默认）
      // });
    },
    handleResetClickTwos() {
      this.setData({
        isPanelVisible: !this.data.isPanelVisible,

      });



    },
    // 搜索按钮
    handleSearchClick() {
      let SelseTitles = "";
      if (this.data.currentIndex == 1 && this.data.SelseIndex !== "" && this.data.SelseIndex !== undefined) {
        const selectedOil = this.data.tabseleList.find(item => item.id == this.data.SelseIndex);
        SelseTitles = selectedOil ? selectedOil.title : "";
      }

      this.triggerEvent("search", {
        keyword: this.data.searchInputValue.trim(),
        filters: this.getSelectedFilters(),
        oilTexts: SelseTitles
      });
      this.setData({ isPanelVisible: false });
    },

    // 确定查询按钮
    handleConfirmClick() {
      let SelseTitles = "";

      // 只有在“柴油” tab（currentIndex == 1）且选中了有效油号时，才设置油号标题
      if (this.data.currentIndex == 1 && this.data.SelseIndex !== "" && this.data.SelseIndex !== undefined) {
        const selectedOil = this.data.tabseleList.find(item => item.id == this.data.SelseIndex);
        if (selectedOil) {
          SelseTitles = selectedOil.title;
        } else {
          SelseTitles = ""; // 找不到匹配项，清空
        }
      } // 否则保持 SelseTitles = ""

      console.log(SelseTitles, '-------------------SelseTitles');

      this.triggerEvent('search', {
        keyword: this.data.searchInputValue.trim(),
        filters: this.getSelectedFilters(),
        oilTexts: SelseTitles
      });

      this.setData({ isPanelVisible: false });
    },

    // 如果父组件期望结构如 { 类型: "0", 场地: "", 服务: "柴油|尿素" }
    getSelectedFilters() {
      const filters = {};
      this.data.localOptionList.forEach(group => {
        const selectedValues = group.list
          .filter(item => item.checkd)
          .map(item => item.value);

        if (selectedValues.length) {
          filters[group.title] = group.multiple
            ? selectedValues.join('|')
            : selectedValues[0];
        } else {
          filters[group.title] = group.multiple ? '' : '0'; // 或根据业务设默认值
        }
      });
      return filters;
    },

    // 处理油号选择点击
    handleSeleTabClick(e) {
      const id = e.currentTarget.dataset.id;
      this.setData({
        SelseIndex: id,
      });
    },

    // 处理主标签点击
    handleTabClick(e) {
      console.log(e.currentTarget.dataset.id, '---------------点击获取到的id')
      const id = e.currentTarget.dataset.id;
      this.setData({
        currentIndex: id,
        isPanelVisible: false,
        searchInputValue: "", // 👈 清空搜索
        SelseIndex: "", // 👈 清空油号
      });

      // 👈 清空筛选项（触发重置）
      this.handleResetClick(); // 或直接调用重置逻辑

      // 通知父组件 tab 切换了
      this.triggerEvent("tabchange", { currentIndex: id });

      setTimeout(() => {
        this.getSiteHeadsPropPosition();
      }, 200);
    },

    // 点击设置图标显示面板
    handleSettingsClick() {
      this.setData({
        isPanelVisible: !this.data.isPanelVisible,
      });

      this.setData({
        searchInputValue: '',
        SelseIndex: ''
      });

      // 2. 重置筛选项
      const resetList = this.data.optionList.map(group => {
        const newGroup = { ...group, list: [...group.list] };
        newGroup.list.forEach((item, i) => {
          item.checkd = (!group.multiple && i === 0);
        });
        return newGroup;
      });

      // 3. 更新本地副本
      this.setData({ localOptionList: resetList });
    },

    // 点击搜索按钮
    // handleSearchClick() {
    //   // 隐藏面板
    //   this.setData({
    //     isPanelVisible: false
    //   });

    //   // 执行搜索逻辑
    //   console.log('执行搜索，关键词：', this.data.searchInputValue);
    //   // 这里可以添加搜索功能的实现
    // },

    // 搜索输入框内容变化
    handleInputChange(e) {
      this.setData({
        searchInputValue: e.detail.value,
      });
    },



    // 点击确定查询
    // handleConfirmClick() {
    //   if (!this.data.SelseIndex&&this.data.currentIndex==1) {
    //     wx.showToast({
    //       title: "请选择油号",
    //       icon: "none",
    //     });
    //     return;
    //   }
    //   // 隐藏面板
    //   this.setData({
    //     isPanelVisible: false,
    //   });

    //   // 执行确定查询逻辑
    //   console.log(
    //     "确定查询，选中油号ID：",
    //     this.data.SelseIndex,
    //     "，关键词：",
    //     this.data.searchInputValue,
    //   );
    //   // 这里可以添加查询功能的实现
    // },

    /**
     * 获取siteHeadsProp元素距离顶部的位置
     */
    getSiteHeadsPropPosition() {
      console.log("开始获取元素位置");

      setTimeout(() => {
        const query = this.createSelectorQuery();
        query
          .select(".siteHeadsProp")
          .boundingClientRect((rect) => {
            if (rect && (rect.height > 0 || rect.width > 0)) {
              console.log("成功获取到siteHeadsProp距离顶部的距离:", rect.top);
              this.setData({
                tops: Math.round(rect.top),
              });
              console.log(rect.top, "--------tops");
            } else {
              console.log("未获取到元素信息或元素尺寸为0");

              // 如果获取失败，使用定时器重试
              setTimeout(() => {
                this.retryGetPosition();
              }, 200);
            }
          })
          .exec();
      }, 100);
    },

    /**
     * 重试获取位置
     */
    retryGetPosition() {
      console.log("重试获取位置");
      const query = this.createSelectorQuery();

      query
        .select(".siteHeadsProp")
        .boundingClientRect((rect) => {
          if (rect && (rect.height > 0 || rect.width > 0)) {
            console.log("重试成功，元素顶部距离:", rect.top);
            this.setData({
              tops: Math.round(rect.top),
            });
          } else {
            console.log("重试仍然失败");
          }
        })
        .exec();
    },
  },
});
