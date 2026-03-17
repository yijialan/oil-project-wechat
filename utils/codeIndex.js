import barcode from './barCode'


// 插件内部是根据width, height参数的rpx值来进行绘画
// 把数字转换成条形码
function toBarcode (canvasId, code, width, height,callback) {
    barcode.code128(wx.createCanvasContext(canvasId), code, width, height,callback,canvasId);
}

module.exports = {
	toBarcode 
}
