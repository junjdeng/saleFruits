//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
  },
  onLoad: function () {
  },
  //页面跳转
  navTo: function (e) {
    wx.navigateTo({ url: e.currentTarget.dataset.url })
  },
})
