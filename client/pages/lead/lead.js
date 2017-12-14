var common = require('../../asset/js/common.js');
var AppPages = common.AppPages;
Page({
    onLoad: function (options) {
    },
    linkPage: function(){
        wx.navigateTo({
            url: AppPages.pageSet
        })
    }
});