var common = require('../../asset/js/common.js');
var FormIdFun = common.FormIdFun;
var AppPages = common.AppPages;
Page({
    onLoad: function (options) {
    },
    linkPage: function(){
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
    }
});