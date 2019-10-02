var config = require('config.js');

function Get(url, data, cb) {
  wx.showNavigationBarLoading();//顶部显示loading效果
  wx.request({
    url: config.BASE_URL + url,
    data: data,
    header: {
      "Content-Type": "application/json",
      "Auth": config.Auth,
      "Refer":config.Refer
    },
    success: (res) => {
      if (res.data.code === 2000) {
        wx.navigateTo({
          url: '/pages/start/start',
        })
      }
      typeof cb == "function" && cb(res.data, "");
      wx.hideNavigationBarLoading();//顶部隐藏loading效果
    },
    fail: (err) => {
      typeof cb == "function" && cb(null, err.errMsg);
      console.log("get 请求:" + config.BASE_URL);
      console.log(err)
      wx.hideNavigationBarLoading();
    }
  })
};

function Post(url, data, cb) {
  wx.request({
    method: 'POST',
    url: config.BASE_URL + url,
    data: data,
    header: {
      "Content-Type": "application/json",
      "Auth": config.Auth,
      "Refer": config.Refer
      // "Content-Type": "application/x-www-form-urlencoded"//跨域请求
    },
    success: (res) => {
      if(res.data.code === 2000){
        wx.navigateTo({
          url: '/pages/start/start',
        })
      }
      typeof cb == "function" && cb(res.data, "");
    },
    fail: (err) => {
      typeof cb == "function" && cb(null, err.errMsg);
      console.log("post 请求:" + config.BASE_URL);
      console.log(err);
    }
  });
};

function UploadFile(filePath,cb){

  wx.uploadFile({
    url: config.BASE_URL + '/uploadImage',
    filePath: filePath,
    name: 'file',
    success: function (res) {
      typeof cb == "function" && cb(res.data, "");
    },
    fail: (err) => {
      typeof cb == "function" && cb(null, err.errMsg);
      console.log("upload 请求:" + config.BASE_URL);
      console.log(err);
    }
  })

}

module.exports = {
  djGet: Get,
  djPost: Post,
  djUpload: UploadFile
}
