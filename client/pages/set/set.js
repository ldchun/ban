var config = require('../../config.js');
var common = require('../../asset/js/common.js');
var DateInfo = common.DateInfo;
var Server = config.service;
var Session = common.Session;
var AppPages = common.AppPages;
var wxShowToast = common.wxShowToast;
var UserIdFun = common.UserIdFun;
var FormIdFun = common.FormIdFun;
Page({
    data: {
        loadclass: 'slhide',
        userface: "",
        usernick: "",
        tailnumArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        tailnum: 5,
        indicatorDots: false,
        autoplay: false,
        circular: true,
        setban: true,
        setwarn: true
    },
    onLoad: function (options) {
        var self = this;
        // 设置用户头像
        wx.getUserInfo({
            success: function (res) {
                var userInfo = res.userInfo;
                var avatarUrl = userInfo.avatarUrl;
                var nickName = userInfo.nickName;
                self.setData({
                    userface: avatarUrl,
                    usernick: nickName
                })
            },
            fail: function () { }
        });
        // 判断用户是否注册
        if ( getApp().globalData.userreg ){
            // 加载用户信息
            loadUserInfo(self);
        }
        else{
            self.setData({
                loadclass: '',
                tailnum: 0
            })
        }
    },
    onHide: function (e) {
        FormIdFun.save();
    },
    onUnload: function (e) {
        FormIdFun.save();
    },
    swipeTailChange: function (e) {
        this.setData({
            tailnum: e.detail.current
        })
    },
    switchBanChange: function (e) {
        this.setData({
            setban: e.detail.value
        })
    },
    switchWarnChange: function (e) {
        this.setData({
            setwarn: e.detail.value
        })
    },
    saveSet: function (e) {
        var inData = {};
        inData.userId = UserIdFun.get();
        inData.usernick = this.data.usernick;
        inData.tail = this.data.tailnum;
        inData.setban = this.data.setban;
        inData.setwarn = this.data.setwarn;
        saveSetting(inData);
    },
    formSubmit: function (e) {
        FormIdFun.pushid(e.detail.formId);
    }
});
// 转换请求参数
function fatServerData(data) {
    var serverData = {};
    serverData.userId = data.userId;
    serverData.nickName = data.usernick;
    serverData.tailNumber = data.tail;
    serverData.confineAlert = data.setban;
    serverData.pollutionAlert = data.setwarn;
    return serverData;
}
// 设置信息加载
function setUserInfo(self, inData) {
    self.setData({
        loadclass: '',
        tailnum: inData.tailNumber,
        setban: inData.confineAlert,
        setwarn: inData.pollutionAlert
    })
}
// 初始化加载设置
function loadUserInfo(self) {
    var inData = {};
    inData.userId = UserIdFun.get();
    wx.showLoading({
        title: '加载中...',
    })
    wx.request({
        url: Server.userInfoUrl,
        data: inData,
        success: function (res) {
            var jsonData = res.data;
            wx.hideLoading();
            setUserInfo(self, jsonData['data']);
        },
        fail: function (error) {
            console.log(error);
            wx.hideLoading();
        }
    })
}
// 保存设置
function saveSetting(data) {
    var inData = fatServerData(data);
    wx.showLoading({
        title: '保存中...',
    })
    wx.request({
        url: Server.userRegUrl,
        data: inData,
        success: function (res) {
            wx.hideLoading();
            wxShowToast({
                title: '保存成功',
                flag: "success"
            })
            // 跳转到主页
            setTimeout(function(){
                wx.reLaunch({
                    url: AppPages.pageBan
                })
            }, 500);
        },
        fail: function (error) {
            console.log(error);
            wx.hideLoading();
            wx.showModal({
                title: '提示',
                content: '保存设置失败，请重新保存',
                showCancel: false,
                success: function (res) { }
            })
        }
    })
}