var config = require('../../config.js');
var Server = config.service;
//    设置
/**            重污染天气来袭，今日出行到底红锅还是鸳鸯锅？ **/
var proName = "重磅！明年1月22日起尾号限行区域扩大，告别“鸳鸯锅”";
// 页面
var AppPages = {
    pageLead: "/pages/lead/lead",
    pageSet: "/pages/set/set",
    pageBan: "/pages/index/index"
};
//判断是否为数组类型
function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}
//扩展输入 flag：true -> 默认深度拷贝
function extendOpt(defOpt, inOpt, flag) {
  var curFlag = true;
  curFlag = ((typeof (flag) != "undefined") && !flag) ? false : true;
  for (var para in inOpt) {
    var curOpt = inOpt[para];
    if (isArray(curOpt) && curFlag) {
      for (var i = 0, size = curOpt.length; i < size; i++) {
        defOpt[para][i] = curOpt[i];
      }
    }
    else {
      if ((typeof (curOpt) == "object")) {
        extendOpt(defOpt[para], curOpt, curFlag);
      }
      else {
        defOpt[para] = curOpt;
      }
    }
  }
  return defOpt;
}
/* 提示语显示封装 */
function wxShowToast(option) {
  var setting = { flag: "success", duration: 2000 };
  if (option === undefined) { option = {}; }
  if (typeof (option) === "object") {
    setting = extendOpt(setting, option);
  }
  var imageUrl = "../../asset/img/tip_success.png";
  switch (setting.flag){
    case "success":
      imageUrl = "../../asset/img/tip_success.png";
      break;
    case "fail":
      imageUrl = "../../asset/img/tip_fail.png";
      break;
    case "warn":
      imageUrl = "../../asset/img/tip_warn.png";
      break;
  }
  setting.image = imageUrl;
  wx.showToast(setting);
}
/* 字符串去掉空格 */
function trim(str, dir){
  var defdir = "lr";
  if (typeof (dir) !== "undefined") {
    defdir = dir;
  }
  switch(dir){
    case "lr":  //去左右空格
      str = str.replace(/(^\s*)|(\s*$)/g, "");
      break;
    case "l":   //去左空格
      str = str.replace(/(^\s*)/g, "");
      break;
    case "r":   //去右空格
      str = str.replace(/(\s*$)/g, "");
      break;
  }
  return str;
}
//获取时间的 年、月、日、星期
function DateInfo(time) {
  var addZero = function (val) {
    var value = (val < 10) ? ("0" + val) : val;
    return value.toString();
  }
  var date = new Date();
  if (typeof (time) != 'undefined') {
    date = new Date(time);
  }
  return {
    year: date.getFullYear(),
    month: addZero(date.getMonth() + 1),
    day: addZero(date.getDate()),
    week: date.getDay()
  };
}
/* 对象转换成url */
function objToUrl(obj){
  var url = "";
}
//校验是否为空
function EmptyCheck(value, msg) {
  var res = true;
  if (value == '') {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false
    })
    res = false;
  }
  return res;
}
// 分享应用
var ShareApp = function (res){
    return {
        title: getApp().globalData.sharetips,
        path: AppPages.pageBan,
        success: function (res) {
            wxShowToast({
                title: '分享成功',
                flag: "success"
            })
        },
        fail: function (res) {
            wxShowToast({
                title: '分享失败',
                flag: "fail"
            })
        }
    }
}
// Session操作
var Session = {
    get: function (sessionkey) {
        return wx.getStorageSync(sessionkey) || null;
    },
    set: function (sessionkey, session) {
        wx.setStorageSync(sessionkey, session);
    },
    clear: function (sessionkey) {
        wx.removeStorageSync(sessionkey);
    },
};
// 用户Id操作函数
var UserIdFun = {
    userkey: "sessionuserid",
    isvalid: function () {
        var userId = Session.get(UserIdFun.userkey);
        return (userId === null) || (userId == '') ? false : true;
    },
    get: function () {
        var userId = Session.get(UserIdFun.userkey);
        return (userId === null) || (userId == '') ? false : userId;
    },
    set: function (userId) {
        Session.clear(UserIdFun.userkey);
        Session.set(UserIdFun.userkey, userId);
    },
    clear: function () {
        Session.clear(UserIdFun.userkey);
    }
};
var FormIdFun = {
    // 计算7天后的过期时间截
    expire: function () {
        return Math.floor(new Date().getTime() / 1000) + 604800;
    },
    // 计算7天后的过期时间截
    pushid: function (id) {
        var formId = id;
        var expire = FormIdFun.expire();
        var data = formId + "," + expire;
        var formIdArr = getApp().globalData.formIdArr;
        formIdArr.push(data);
        if(formIdArr.length > 10){
            formIdArr.shift();
        }
        getApp().globalData.formIdArr = formIdArr;
    },
    // 保存formIds
    save: function(){
        var formIdArr = getApp().globalData.formIdArr;
        do{
            if (formIdArr.length <= 0) {
                break;
            }
            var inData = {};
            inData.userId = UserIdFun.get();
            inData.formIds = "";
            inData.formIds = formIdArr.join("|");
            wx.request({
                url: Server.saveFormIds,
                data: inData,
                success: function (res) {
                    console.log(res.data);
                },
                fail: function (error) {
                    console.log(error)
                }
            })
            getApp().globalData.formIdArr = [];
        }while(0);
    }
};
/* 公共API接口定义 */
module.exports = {
    wxShowToast: wxShowToast,
    EmptyCheck: EmptyCheck,
    trim: trim,
    DateInfo: DateInfo,
    ShareApp: ShareApp,
    Session: Session,
    AppPages: AppPages,
    UserIdFun: UserIdFun,
    FormIdFun: FormIdFun
}