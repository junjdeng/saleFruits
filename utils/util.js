var djRequest = require('request.js');
var config = require('config.js');
const app = getApp()

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const getTodayDateInfo = function getTodayDateInfo() {
  const time = new Date;
  const m = time.getMonth() + 1; /*月份*/
  const t = time.getDate(); /*天数*/
  var d = time.getDay(); /*星期X*/
  if (d == 0) {
    d = "周天";
  } else if (d == 1) {
    d = "周一";
  } else if (d == 2) {
    d = "周二"
  } else if (d == 3) {
    d = "周三";
  } else if (d == 4) {
    d = "周四";
  } else if (d == 5) {
    d = "周五";
  } else if (d == 6) {
    d = "周六";
  }
  return { "month": m, "day": t, "week": d };
}

const getCurrentDateTime = function getCurrentDateTime() {
  const date = new Date;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

const getCurrentDate = function getCurrentDate() {
  const date = new Date;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year + '-' + month + '-' + day;
}

const getResetDHMS = interval => {
  var days = Math.floor(interval / (24 * 3600 * 1000))
  //计算出小时数
  var leave1 = interval % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
  var hours = Math.floor(leave1 / (3600 * 1000))
  //计算相差分钟数
  var leave2 = leave1 % (3600 * 1000)        //计算小时数后剩余的毫秒数
  var minutes = Math.floor(leave2 / (60 * 1000))
  //计算相差秒数
  var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
  var seconds = Math.round(leave3 / 1000)
  return days + "天    " + [hours, minutes, seconds].map(formatNumber).join(':'); 
}

const djToast = text => {
  wx.showToast({
    title: text,
    icon: 'none',
    duration: 2000
  })
}

const login = function Login() {
  var params = {
    "code": app.globalData.userCode, //wx.login接口返回参数,
    "encryptedData": app.globalData.encryptedData, //微信获取用户信息接口返回,对应button组件 open-type="getUserInfo" bindgetuserinfo="getInfo"
    "iv": app.globalData.iv, //微信获取用户信息接口返回,对应button组件 open-type="getUserInfo" bindgetuserinfo="getInfo"
    "name": app.globalData.userInfo.nickName, //用户昵称 :对应接口用户信息里的 nickName
    "header_img": app.globalData.userInfo.avatarUrl, //用户头像: 对应接口用户信息的 avatarUrl
    "sex": app.globalData.userInfo.gender, //用户性别: 对应接口用户信息的 gender
  }
  //console.log(params);
  djRequest.djPost("/xcxLogin", params, function(res) {
    console.log(res);
    if (res.code == 0) {
      config.Auth = res.data.auth
      config.Code = res.data.user_info.code,
      wx.getStorage({
        key: 'shared_order_sn',
        success: function(res) {
           if(res.data == undefined || res.data == ""){
             wx.reLaunch({
               url: '../index/index'
             })
           }else{
             wx.navigateTo({
               url: '/pages/fund/fundShared?order_sn='+res.data,
             })
           }
        },
        fail:function(){
          wx.reLaunch({
            url: '../index/index'
          })
        }
      })
    } else {
      wx.reLaunch({
        url: '../index/index'
      })
    }
  })
}

const availablePhone = num => {
  var reg = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
  if (!reg.test(num)) {
    wx.showToast({
      title: '电话号码格式有误，请重新输入',
      icon: "none",
      mask: true,
      duration: 2500
    })
    return false;
  }
  return true;
}

const validateIdCard = idCard => {
  var vcity = {
    11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古",
    21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏",
    33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南",
    42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆",
    51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃",
    63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外"
  };
  //是否为空
  if (idCard === '') {
    return false;
  }
  //校验长度，类型
  if (isCardNo(idCard) === false) {
    return false;
  }
  //检查省份
  if (checkProvince(idCard, vcity) === false) {
    return false;
  }
  //校验生日
  if (checkBirthday(idCard) === false) {
    return false;
  }
  //检验位的检测
  if (checkParity(idCard) === false) {
    return false;
  }
  return true;
}

function isCardNo(card) {
  //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
  var reg = /(^\d{15}$)|(^\d{17}(\d|X|x)$)/;
  if (reg.test(card) === false) {
    return false;
  }
  return true;
}

function checkProvince(card, vcity) {
  var province = card.substr(0, 2);
  if (vcity[province] == undefined) {
    return false;
  }
  return true;
};

function checkBirthday(card) {
  var len = card.length;
  //身份证15位时，次序为省（3位）市（3位）年（2位）月（2位）日（2位）校验位（3位），皆为数字
  if (len == '15') {
    var re_fifteen = /^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/;
    var arr_data = card.match(re_fifteen);
    var year = arr_data[2];
    var month = arr_data[3];
    var day = arr_data[4];
    var birthday = new Date('19' + year + '/' + month + '/' + day);
    return verifyBirthday('19' + year, month, day, birthday);
  }
  //身份证18位时，次序为省（3位）市（3位）年（4位）月（2位）日（2位）校验位（4位），校验位末尾可能为X
  if (len == '18') {
    var re_eighteen = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X|x)$/;
    var arr_data = card.match(re_eighteen);
    var year = arr_data[2];
    var month = arr_data[3];
    var day = arr_data[4];
    var birthday = new Date(year + '/' + month + '/' + day);
    return verifyBirthday(year, month, day, birthday);
  }
  return false;
};


function verifyBirthday(year, month, day, birthday) {
  var now = new Date();
  var now_year = now.getFullYear();
  //年月日是否合理
  if (birthday.getFullYear() == year && (birthday.getMonth() + 1) == month && birthday.getDate() == day) {
    //判断年份的范围（0岁到100岁之间)
    var time = now_year - year;
    if (time >= 0 && time <= 100) {
      return true;
    }
    return false;
  }
  return false;
}

function checkParity(card) {
  //15位转18位
  card = changeFivteenToEighteen(card);
  var len = card.length;
  if (len == '18') {
    var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
    var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
    var cardTemp = 0, i, valnum;
    for (i = 0; i < 17; i++) {
      cardTemp += card.substr(i, 1) * arrInt[i];
    }
    valnum = arrCh[cardTemp % 11];
    if (valnum == card.substr(17, 1).toLocaleUpperCase()) {
      return true;
    }
    return false;
  }
  return false;
}

function changeFivteenToEighteen(card) {
  if (card.length == '15') {
    var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
    var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
    var cardTemp = 0, i;
    card = card.substr(0, 6) + '19' + card.substr(6, card.length - 6);
    for (i = 0; i < 17; i++) {
      cardTemp += card.substr(i, 1) * arrInt[i];
    }
    card += arrCh[cardTemp % 11];
    return card;
  }
  return card;
}



const isNotNull = (text,title) => {
  if (text == null || text == undefined || text.length == 0 || text == "" || text.replace(/\s+/g, '')=="") {
    wx.showToast({
      title: title+'不可为空',
      icon: "none",
      mask: true,
      duration: 2500
    })
    return false;
  }
  return true;
}

module.exports = {
  formatTime: formatTime,
  djToast: djToast,
  login: login,
  availablePhone: availablePhone,
  isNotNull: isNotNull,
  getCurrentDate: getCurrentDate,
  getResetDHMS: getResetDHMS,
  validateIdCard: validateIdCard
}