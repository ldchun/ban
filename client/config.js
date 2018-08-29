/**
 * 小程序配置文件
 */
// 此处主机域名修改成腾讯云解决方案分配的域名
// var host = 'https://zgzvnrur.qcloud.la'; // 腾讯云env开发地址
// var host = 'https://329034146.chunapp.xyz'; // 腾讯云prod生产地址
var host = 'https://renxingstyle.xyz/ban'; // prod

var config = {
    // 下面的地址配合云端 Demo 工作
    service: {
        host,
        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,
        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,
        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,
        // 上传图片接口
        uploadUrl: `${host}/weapp/upload`,

    /************** 增加功能 php qcloud****************/
        // // 用户登录
        // wxloginUrl: `${host}/weapp/ban/wxlogin`,
        // // 用户是否注册
        // isRegisterUrl: `${host}/weapp/ban/isregister`,
        // // 用户信息
        // userInfoUrl: `${host}/weapp/ban/userinfo`,
        // // 用户注册并设置
        // userRegUrl: `${host}/weapp/ban/userreg`,
        // // 用户更新设置
        // setUpdateUrl: `${host}/weapp/ban/setupdate`,
        // // 获取限行数据
        // getBanDataUrl: `${host}/weapp/ban/getdata`,
        // // 发送通知提醒
        // sendMsgUrl: `${host}/weapp/notice/sendmsg`,
        // // 保存FormIds
        // saveFormIds: `${host}/weapp/notice/saveFormIds`,

    /************** 增加功能 java aliplay****************/
        // 用户登录
        wxloginUrl: `${host}/user/wxlogin`,
        // 用户是否注册
        isRegisterUrl: `${host}/user/isRegister`,
        // 用户信息
        userInfoUrl: `${host}/user/userInfo`,
        // 用户注册并设置
        userRegUrl: `${host}/user/register`,
        // 用户更新设置
        setUpdateUrl: `${host}/user/update`,
        // 获取限行数据
        getBanDataUrl: `${host}/alert`,
        // 保存FormIds
        saveFormIds: `${host}/user/addFromId`,
        // 发送通知提醒
        sendMsgUrl: `${host}/sendmsg`
    }
};
module.exports = config;