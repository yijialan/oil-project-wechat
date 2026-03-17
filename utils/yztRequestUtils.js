// 前端接口加密：
import Base64 from "./we-base64";
import Md5zh from "./zhmd5";

// 司机端的signature方法
const CLIENT_ID = 'b66b3557-d433-11ed-9b37-6c92bf5ca622'
const CLIENT_SECRET = 'bc9a2ddc-d433-11ed-9b37-6c92bf5ca622'
const signature = Base64.encode(CLIENT_ID + ':' + CLIENT_SECRET);

function getSignatureFUn() {
    return signature
}
// 排序
function sortParams(params) {
    var keys = Object.keys(params).sort();
    var paramsort = ''
    for (var i = 0, n = keys.length, key; i < n; ++i) {
        key = keys[i];
        if (params[key] != null && params[key] != undefined) {
            paramsort += key + '=' + params[key];
        } else {
            paramsort += key + '=';
        }
    }
    return paramsort;
}

function headersFun(postData = {}) {
    const userInfo = wx.getStorageSync('userInfo')
    const T = Date.now() + ''
    const V = 2
    const U = userInfo.unionid
    const headers = {
        T: T, // 时间戳
        V: V, //1壹加蓝柴油补给后台 2司机端 3物流端 4油站端
        U: U, // 用户标识
        Sign: Md5zh.md5(sortParams(postData) + T + U + V + signature)
    };
    return headers
}


export { headersFun }