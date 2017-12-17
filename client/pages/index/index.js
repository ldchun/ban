var config = require('../../config.js');
var common = require('../../asset/js/common.js');
var DateInfo = common.DateInfo;
var Server = config.service;
var Session = common.Session;
var AppPages = common.AppPages;
var UserIdFun = common.UserIdFun;
var FormIdFun = common.FormIdFun;
// 变量设置
var weekCN = ['日','一','二','三','四','五','六'];
var imgUrlBase = "../../asset/image/";
// 设置时间
var setDateInfo = function (self) {
    var dateinfo = new DateInfo();
    self.setData({
        dateday: dateinfo.year + '/' + dateinfo.month + '/' + dateinfo.day,
        dateweek: '周' + weekCN[dateinfo.week]
    })
};
//返回污染预警图片
// 0->"蓝天白云";1->黄；2->黄；3->橙；4->红
var getPollImg = function(level){
    var pollImgArr = ["img-road.png", "poll-blue.png", "poll-yellow.png", "poll-orange.png", "poll-red.png"];
    return imgUrlBase + pollImgArr[level];
};
//返回限行地图
var getBanMap = function (mode) {
    var banMapArr = ["area-yy.png", "area-red.png"];
    return imgUrlBase + banMapArr[mode-1];
};
//返回限行地图
var getBanTail = function (tail) {
    return tail.split(",").join("/");
};
// 转换请求参数
function fatServerData(data) {
    var serverData = {};
    serverData.bancar = data.confine;
    serverData.pollclass = data.pollutionLevel;
    serverData.bantail = data.confineNumbers;
    serverData.bantime = data.confineTime;
    serverData.banmode = data.confineModel;
    serverData.banarea = data.alertNotify;
    serverData.banmap = data.confineMapTag;
    return serverData;
}
// 更新信息
function updateBanInfo(self, data){
    // 限行颜色
    var getBancolor = function(bancar){
        return (bancar == "限行") ? 'forbid' : ''
    };
    self.setData({
        loadclass: "",
        bancar: data.bancar,
        bancolor: getBancolor(data.bancar),
        pollimg: getPollImg(data.pollclass),
        bantail: getBanTail(data.bantail),
        bantime: data.bantime,
        banmode: data.banmode,
        banarea: data.banarea,
        banmapimg: getBanMap(data.banmap),
    })
}
// 登录
function appLogin(callback){
    // 是否为注册用户
    function userIsReg(userid) {
        do{
            // userid是否有效
            if (!UserIdFun.isvalid()) {
                userLogin();
                break;
            }
            // 用户是否已经注册
            if (getApp().globalData.userreg) {
                if (typeof (callback) != 'undefined') {
                    callback();
                }
                break;
            }
            // 服务器校验是否为注册用户
            wx.showLoading({
                title: '加载中...',
            })
            var inData = {};
            inData.userId = userid;
            wx.request({
                url: Server.isRegisterUrl,
                data: inData,
                success: function (res) {
                    wx.hideLoading();
                    var jsonData = res.data;
                    var code = jsonData['code'];
                    switch (code) {
                        // 用户未注册
                        case 404:
                            wx.reLaunch({
                                url: AppPages.pageLead
                            })
                            break;
                        // 用户已经注册
                        case 200:
                            getApp().globalData.userreg = true;
                            if (typeof (callback) != 'undefined') {
                                callback();
                            }
                            break;
                    }
                },
                fail: function (error) {
                    console.log(error)
                }
            })
        }while(0);
    }
    // 用户登录获取userId,保存在session
    function userLogin() {
        wx.login({
            success: function (res) {
                wx.hideLoading();
                if (res.code) {
                    wx.request({
                        url: Server.wxloginUrl,
                        data: { code: res.code },
                        success: function (res) {
                            var jsonData = res.data;
                            var userId = jsonData['data'];
                            // 设置userId
                            UserIdFun.set(userId);
                            // 检查用户
                            userIsReg(userId);
                        }
                    })
                } else {
                    console.log('获取用户登录态失败！' + res.errMsg)
                }
            },
            fail: function (err) {
                wx.hideLoading();
            }
        });
    }
    // 登录态检查
    wx.checkSession({
        success: function () {
            console.log("Login state：未过期");
            var userId = UserIdFun.get();
            userIsReg(userId);
        },
        fail: function () {
            console.log("Login state：过期");
            // 登录
            userLogin();
        }
    })
}
Page({
    data: {
        loadclass: 'slhide',
        dateday: "",
        dateweek: "",
        bancar: "不限",
        bancolor: "",
        pollimg: getPollImg(0),
        bantail: "",
        bantime: '',
        banmode: '',
        banarea: '',
        banmapimg: getBanMap(1),
    },
    onLoad: function (options) {
        var self = this;
        // 设置时间信息
        setDateInfo(this);
        // 登录判断
        appLogin(function(){
            // 从服务器获取限行信息
            getBanInfo(self);
        });
    },
    onShareAppMessage: common.ShareApp,
    linkPageSet: function(){
        wx.navigateTo({
            url: AppPages.pageSet
        })
    },
    formSubmit: function (e) {
        var formId = e.detail.formId;
        var expire = FormIdFun.expire();
        var formIdArr = getApp().globalData.formIdArr;
        var data = formId + "&" + expire;
        formIdArr.push(data);
        getApp().globalData.formIdArr = formIdArr;
    },
    sendMsg: function (e) {
        var inData = {};
        inData.type = "ban";
        inData.userId = UserIdFun.get();
        inData.formId = "";
        var formIdArr = getApp().globalData.formIdArr;
        if (formIdArr.length > 0){
            inData.formId = formIdArr[0].split("&")[0];
        }
        formIdArr.shift();
        getApp().globalData.formIdArr = formIdArr;
        this.setData({
            bantail: inData.formId
        });
        wx.request({
            url: Server.sendMsgUrl,
            data: inData,
            success: function (res) {
                console.log(res.data);
            },
            fail: function (error) {
                console.log(error)
            }
        })
    }
});
// 获取请求参数
function getInData(){
    var inData = {};
    var dateinfo = new DateInfo();
    inData.date = dateinfo.year + '-' + dateinfo.month + '-' + dateinfo.day;
    inData.userId = UserIdFun.get();
    return inData;
}
// 请求限行数据
function getBanInfo(self){
    var inData = new getInData();
    self.setData({
        loadclass: "slhide"
    })
    wx.showLoading({
        title: '加载中...',
    })
    wx.request({
        url: Server.getBanDataUrl,
        data: inData,
        success: function (res) {
            wx.hideLoading();
            var banData = fatServerData(res.data['data']);
            updateBanInfo(self, banData);
        },
        fail: function (error) {
            console.log(error)
        }
    })
}