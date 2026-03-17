const API_BASE_URL = 'https://liant.nbymwl.com'
const request = (url, needSubDomain, method, data) => {
  let _url = API_BASE_URL + (needSubDomain ? '/' : '') + url
  return new Promise((resolve, reject) => {
    wx.request({
      url: _url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success(request) {
        if (request.data.code == 4) {
          wx.showToast({
            title: '登录失效,请重新登录',
            icon: 'none',
            duration: 1000
          })
        } else {
          resolve(request.data)
        }
      },
      fail(error) {
        reject(error)
      },
      complete(aaa) {
        // 加载完成
      }
    })
  })
}

/**
 * 小程序的promise没有finally方法，自己扩展下
 */
Promise.prototype.finally = function (callback) {
  var Promise = this.constructor;
  return this.then(
    function (value) {
      Promise.resolve(callback()).then(
        function () {
          return value;
        }
      );
    },
    function (reason) {
      Promise.resolve(callback()).then(
        function () {
          throw reason;
        }
      );
    }
  );
}
module.exports = {
  request,
  checkToken: (data) => {
    return request('api/login/checkToken?t=' + Math.random(), true, 'post', data)
  },
  login: (data) => {
    return request('api/login/index', true, 'post', data)
  },
  index: (data) => {
    return request('api/index/index', true, 'post', data)
  },
  articelList: (data) => {
    return request('api/article/index', true, 'post', data)
  },
  articleInfo: (data) => {
    return request('api/article/info', true, 'post', data)
  },
  trainIndex: (data) => {
    return request('api/train/index', true, 'post', data)
  },
  trainClassify: (data) => {
    return request('api/train/classify', true, 'post', data)
  },
  trainClassifyTheme: (data) => {
    return request('api/train/classifyTheme', true, 'post', data)
  },
  trainAdd: (data) => {
    return request('api/train/trainAdd', true, 'post', data)
  },
  trainDetail:(data)=>{
    return request('api/train/trainDetail', true, 'post', data)
  },
  productList:(data)=>{
    return request('api/product/productList', true, 'post', data)
  },
  productDetail:(data)=>{
    return request('api/product/productDetail', true, 'post', data)
  },
  userInfo:(data)=>{
    return request('api/home/userInfo', true, 'post', data)
  },
  examList:(data)=>{
    return request('api/examination/examList', true, 'post', data)
  }

}