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
                fail: function (err) {
					wx.hideLoading();
                    console.log(err)
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
                        },
                        fail: function (err) {
                            console.log(err);
                        }
                    })
                } else {
                    console.log('获取用户登录态失败！' + res.errMsg)
                }
            },
            fail: function (err) {
                wx.hideLoading();
				console.log(err);
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
        popclass: 'slhide',
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
        shareimgSrc: ""
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
    onHide: function(e){
        FormIdFun.save();
    },
    onUnload: function (e) {
        FormIdFun.save();
    },
    onShareAppMessage: common.ShareApp,
    linkPageSet: function(){
        wx.navigateTo({
            url: AppPages.pageSet
        })
    },
    banPopShow: function () {
        this.setData({
            popclass: ""
        })
    },
    banPopHide: function () {
        this.setData({
            popclass: "slhide"
        })
    },
    formSubmit: function (e) {
        FormIdFun.pushid(e.detail.formId);
    },
    sendMsg: function (e) {
        var inData = {};
        inData.type = "ban";
        inData.userId = UserIdFun.get();
        inData.formId = "";
        var formIdArr = getApp().globalData.formIdArr;
        if (formIdArr.length > 0){
            inData.formId = formIdArr[0].split(",")[0];
        }
        formIdArr.shift();
        getApp().globalData.formIdArr = formIdArr;
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
    },
    // 生成分享图
    createShareImg: function(){
        var self = this;
        wx.showLoading({
            title: '正在生成图片...',
            mask: true
        })
        // 获取用户信息
        wx.getUserInfo({
            success: function (res) {
                var userInfo = res.userInfo;
                var avatarUrl = userInfo.avatarUrl;
                wx.downloadFile({
                    url: avatarUrl,
                    success: function (res) {
                        userInfo.faceimg = res.tempFilePath;
                        drawShareImg(self, userInfo);
                    }
                })
            },
            fail: function () { }
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
//画分享图
function drawShareImg(self, userInfo) {
    var canvasInfo = {
        width: 420,
        height: 747
    };
    //物理像素比
    var sysInfo = wx.getSystemInfoSync();
    var pixelRatio = sysInfo.pixelRatio;
    var shareBannerImg = {
        src: "../../asset/image/sharebanner.jpg",
        width: 420,
        height: 506
    };
    const ctx = wx.createCanvasContext('myCanvas');
    // 底色白色
    ctx.beginPath();
    ctx.rect(0, 0, canvasInfo.width, canvasInfo.height);
    ctx.setFillStyle('#FFFFFF');
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    // 顶部banner
    ctx.drawImage(shareBannerImg.src, 0, 0, shareBannerImg.width, shareBannerImg.height);
    ctx.closePath();
    // 头像
    var faceImg = userInfo.faceimg;
    //画圆形图片
    function circleImg(ctx, img, x, y, r) {
        ctx.save();
        var d = 2 * r;
        var cx = x + r;
        var cy = y + r;
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img, x, y, d, d);
        ctx.restore();
    }
    circleImg(ctx, faceImg, 168, 466, 40);

    ctx.beginPath();
    ctx.arc(208, 506, 40, 0, 2 * Math.PI);
    ctx.setLineWidth(2);
    ctx.setStrokeStyle('white');
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    // 昵称
    var nickName = userInfo.nickName;
    ctx.setTextAlign('center');
    ctx.setFillStyle('#333333');
    ctx.setFontSize(16);
    ctx.fillText(nickName, 210, 562);
    //文案
    ctx.setFillStyle('#666666');
    ctx.setTextAlign('center');
    ctx.setFontSize(18);
    ctx.fillText("邀你开启，成都重污染天气预警实时提醒", 210, 590);
    ctx.closePath();

    ctx.beginPath();
    // 二维码
    var qrImg = "../../asset/image/qr.jpg";
    ctx.drawImage(qrImg, 80, 605, 110, 110);
    // 长按识别
    ctx.rect(210, 633, 2, 42);
    ctx.setFillStyle('yellow');
    ctx.fill();
    ctx.setTextAlign('left');
    ctx.setFillStyle('#868686');
    ctx.setFontSize(17);
    ctx.fillText("长按识别小程序码", 220, 648);
    ctx.fillText("爱车出行无烦恼", 220, 673);
    ctx.closePath();
    ctx.draw();
    // 保存图片
    setTimeout(function savePic() {
        wx.canvasToTempFilePath({
            destWidth: canvasInfo.width * pixelRatio,
            destHeight: canvasInfo.height * pixelRatio,
            canvasId: 'myCanvas',
            success: function (res) {
                var imgPath = res.tempFilePath;
                wx.hideLoading();
                // 预览图片
                wx.previewImage({
                    current: imgPath,
                    urls: [imgPath]
                })
            },
            fail: function (err) {
                console.log(err);
            }
        })
    }, 500);
}

