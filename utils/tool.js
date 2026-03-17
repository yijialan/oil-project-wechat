/*函数节流*/
function throttle(fn, interval) {
  var enterTime = 0; //触发的时间
  var gapTime = interval || 300; //间隔时间，如果interval不传，则默认300ms
  return function () {
    var context = this;
    var backTime = new Date(); //第一次函数return即触发的时间
    if (backTime - enterTime > gapTime) {
      fn.call(context, ...arguments);
      enterTime = backTime; //赋值给第一次触发的时间，这样就保存了第二次触发的时间
    }
  };
}

/*函数防抖*/
function debounce(fn, interval) {
  var timer;
  var gapTime = interval || 1000; //间隔时间，如果interval不传，则默认1000ms
  return function () {
    clearTimeout(timer);
    var context = this;
    var args = arguments; //保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
    timer = setTimeout(function () {
      fn.call(context, ...args);
    }, gapTime);
  };
}
/* 获取当前页url */
function getCurrentPageUrl() {
  //eslint-disable-next-line
  const pages = getCurrentPages(); // 获取加载的页面
  const currentPage = pages[pages.length - 1]; // 获取当前页面的对象
  const url = currentPage.route; // 当前页面url
  return url;
}
/* 获取当前页带参数的url */
function getCurrentPageUrlWithArgs() {
  //eslint-disable-next-line
  const pages = getCurrentPages(); // 获取加载的页面
  const currentPage = pages[pages.length - 1]; // 获取当前页面的对象
  const url = currentPage.route; // 当前页面url
  const options = currentPage.options; // 如果要获取url中所带的参数可以查看options
  // 拼接url的参数
  let urlWithArgs = url + "?";
  for (const key in options) {
    const value = options[key];
    urlWithArgs += key + "=" + value + "&";
  }
  urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);
  return urlWithArgs;
}

function JSONPARSE(strings) {
  console.log("strings", strings);
  return JSON.parse(strings);
}
function JSONStringify(strings) {
  console.log("strings", strings);
  return JSON.stringify(strings);
}

/**
 * 判断是否为空
 */
function isEmpty(value) {
  switch (typeof value) {
    case "undefined":
      return true;
    case "string":
      if (value.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, "").length == 0)
        return true;
      break;
    case "boolean":
      if (!value) return true;
      break;
    case "number":
      if (0 === value || isNaN(value)) return true;
      break;
    case "object":
      if (null === value || value.length === 0) return true;
      for (var i in value) {
        return false;
      }
      return true;
  }
  return false;
}

function initLocationPersmiss() {
  //定位授权
  return new Promise((resolve, reject) => {
    var _this = this;
    wx.getSetting({
      success: (res) => {
        // res.authSetting['scope.userLocation'] == undefined  表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false  表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true  表示 地理位置授权
        if (
          res.authSetting["scope.userLocation"] != undefined &&
          res.authSetting["scope.userLocation"] != true
        ) {
          //未授权
          wx.showModal({
            title: "请求授权当前位置",
            content: "需要获取您的地理位置，请确认授权",
            success: function (res) {
              if (res.cancel) {
                //取消授权
                wx.showToast({
                  title: "拒绝授权 暂时无法使用本功能",
                  icon: "none",
                  duration: 1000,
                });
                resolve(false);
              } else if (res.confirm) {
                //确定授权，通过wx.openSetting发起授权请求
                wx.openSetting({
                  success: function (res) {
                    if (res.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: "授权成功",
                        icon: "success",
                        duration: 1000,
                      });
                      //再次授权，调用wx.getLocation的API
                      resolve(true);
                    } else {
                      wx.showToast({
                        title: "授权失败",
                        icon: "none",
                        duration: 1000,
                      });
                      resolve(false);
                    }
                  },
                });
              }
            },
          });
        } else if (res.authSetting["scope.userLocation"] == undefined) {
          // 用户首次进入页面，主动发起授权
          wx.authorize({
            scope: "scope.userLocation",
            success: () => {
              resolve(true);
            },
            fail: () => {
              wx.showToast({
                title: "未授权定位，无法使用该功能",
                icon: "none",
                duration: 1500,
              });
              resolve(false);
            },
          });
        } else {
          console.log("授权成功");
          //调用wx.getLocation的API
          resolve(true);
        }
      },
    });
  });
}

/**
 * 数组对象排序
 */
function compare(name) {
  return function (o, p) {
    var a, b;
    if (typeof o === "object" && typeof p === "object" && o && p) {
      a = o[name];
      b = p[name];
      if (a === b) {
        return 0;
      }
      if (typeof a === typeof b) {
        return a < b ? -1 : 1;
      }
      return typeof a < typeof b ? -1 : 1;
    } else {
      throw "error";
    }
  };
}

/**
 * 对象转url参数
 * @param {*} data,对象
 * @param {*} isPrefix,是否自动加上"?"
 */
function queryParams(data = {}, isPrefix = true, arrayFormat = "brackets") {
  let prefix = isPrefix ? "?" : "";
  let _result = [];
  if (["indices", "brackets", "repeat", "comma"].indexOf(arrayFormat) == -1)
    arrayFormat = "brackets";
  for (let key in data) {
    let value = data[key];
    // 去掉为空的参数
    if (["", undefined, null].indexOf(value) >= 0) {
      continue;
    }
    // 如果值为数组，另行处理
    if (value.constructor === Array) {
      // e.g. {ids: [1, 2, 3]}
      switch (arrayFormat) {
        case "indices":
          // 结果: ids[0]=1&ids[1]=2&ids[2]=3
          for (let i = 0; i < value.length; i++) {
            _result.push(key + "[" + i + "]=" + value[i]);
          }
          break;
        case "brackets":
          // 结果: ids[]=1&ids[]=2&ids[]=3
          value.forEach((_value) => {
            _result.push(key + "[]=" + _value);
          });
          break;
        case "repeat":
          // 结果: ids=1&ids=2&ids=3
          value.forEach((_value) => {
            _result.push(key + "=" + _value);
          });
          break;
        case "comma":
          // 结果: ids=1,2,3
          let commaStr = "";
          value.forEach((_value) => {
            commaStr += (commaStr ? "," : "") + _value;
          });
          _result.push(key + "=" + commaStr);
          break;
        default:
          value.forEach((_value) => {
            _result.push(key + "[]=" + _value);
          });
      }
    } else {
      _result.push(key + "=" + value);
    }
  }
  return _result.length ? prefix + _result.join("&") : "";
}

/**
 * 深拷贝
 */
function deepClone(obj) {
  //判断传进来的参数类型不是对象数组 或者是null时 直接返回
  if (typeof obj !== "object" || obj == null) {
    return obj;
  }
  //定义返回值result
  // 判断传进来的数据类型 是数组/对象 就给result一个数组/对象
  let result = Array.isArray(obj) ? [] : {};
  //循环遍历方便拷贝
  for (let key in obj) {
    //判读自有属性
    if (obj.hasOwnProperty(key)) {
      //函数递归实现深层拷贝
      result[key] = deepClone(obj[key]);
    }
  }
  //返回出去
  return result;
}

/**
 * 去除富文本标签
 * @param {*} value 富文本
 * @returns
 */
function removeTag(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, "")
    .replace(/&ldquo;/g, "")
    .replace(/&rdquo;/g, "");
}

export default {
  throttle,
  debounce,
  getCurrentPageUrl,
  getCurrentPageUrlWithArgs,
  JSONPARSE,
  JSONStringify,
  isEmpty,
  initLocationPersmiss,
  compare,
  queryParams,
  deepClone,
  removeTag,
};
