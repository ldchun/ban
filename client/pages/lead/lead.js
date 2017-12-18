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
    onHide: function (e) {
        FormIdFun.save();
    },
    onUnload: function (e) {
        FormIdFun.save();
    },
    formSubmit: function (e) {
        FormIdFun.pushid(e.detail.formId);
    }
});