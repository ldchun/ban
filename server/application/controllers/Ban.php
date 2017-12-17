<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use \QCloud_WeApp_SDK\Auth\LoginService as LoginService;
use QCloud_WeApp_SDK\Constants as Constants;

class Ban extends CI_Controller {
    /**
	 * [http 调用接口函数]
	 * @Date   2016-07-11
	 * @Author GeorgeHao
	 * @param  string       $url     [接口地址]
	 * @param  array        $params  [数组]
	 * @param  string       $method  [GET\POST\DELETE\PUT]
	 * @param  array        $header  [HTTP头信息]
	 * @param  integer      $timeout [超时时间]
	 * @return [type]                [接口返回数据]
	 */
	public function http($url, $params, $method = 'GET', $header = array(), $timeout = 50) {
		// POST 提交方式的传入 $set_params 必须是字符串形式
		$opts = array(
			CURLOPT_TIMEOUT => $timeout,
			CURLOPT_RETURNTRANSFER => 1,
			CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_SSL_VERIFYHOST => false,
			CURLOPT_HTTPHEADER => $header
		);
		/* 根据请求类型设置特定参数 */
		switch (strtoupper($method)) {
			case 'GET':
				$opts[CURLOPT_URL] = $url . '?' . http_build_query($params);
				break;
			case 'POST':
				$params = http_build_query($params);
				$opts[CURLOPT_URL] = $url;
				$opts[CURLOPT_POST] = 1;
				$opts[CURLOPT_POSTFIELDS] = $params;
				break;
			case 'DELETE':
				$opts[CURLOPT_URL] = $url;
				$opts[CURLOPT_HTTPHEADER] = array("X-HTTP-Method-Override: DELETE");
				$opts[CURLOPT_CUSTOMREQUEST] = 'DELETE';
				$opts[CURLOPT_POSTFIELDS] = $params;
				break;
			case 'PUT':
				$opts[CURLOPT_URL] = $url;
				$opts[CURLOPT_POST] = 0;
				$opts[CURLOPT_CUSTOMREQUEST] = 'PUT';
				$opts[CURLOPT_POSTFIELDS] = $params;
				break;
			default:
				throw new Exception('不支持的请求方式！');
		}
	
		/* 初始化并执行curl请求 */
		$ch = curl_init();
		curl_setopt_array($ch, $opts);
		$data = curl_exec($ch);
		$error = curl_error($ch);
		
		return $data;
    }
    /*
	* 编码openid生成userId
	*/
    public function encodeId($openid) {
        // 用户openid
        $id_length = strlen($openid);
        $cut_index = ($id_length > 10) ? 10 : 5;
        // 前后调转生成 userId
        $idfront = substr($openid, 0,  $cut_index);
        $idend = substr($openid, $cut_index);
        $userId = $idend . $idfront;
        return $userId;
    }
    /*
	* 用户登录
	*/
    public function wxlogin() {
        // 输入参数
        $code = $_GET['code'];
        // 输入判断
        $code = isset($code) ? $code : '';
        // 请求参数
        $url_unionid = "https://api.weixin.qq.com/sns/jscode2session";
        $data = array( "appid" => 'wx251a2f2703a415d6', "secret" => '1aa108ab34bb8eadd4c620564ffde846', "grant_type" => 'authorization_code', "js_code" => $code);
		// 请求数据
        $result = Ban::http($url_unionid, $data);
        $res = json_decode($result);
        // openid
        $openid = $res->openid;
        // openid编码生成用户id
        $userid = Ban::encodeId($openid);
        $this->json([
            'msg' => $openid,
            'code' => 200,
            'data' => $userid
        ]);
    }
    /*
	* 用户是否注册
	*/
    public function isregister() {
        // 输入参数
        $userId = $_GET['userId'];
        // 输入判断
        $userId = isset($userId) ? $userId : '';
        // 请求参数
        $url_isreg = "https://bilifun.co/user/isRegister";
        $data = array("userId" => $userId);
		// 请求数据
        $result = Ban::http($url_isreg, $data);
        $res = json_decode($result);
        
        $this->json([
            'msg' => $res->msg,
            'code' => $res->code,
            'data' => $res->data
        ]);
    }
    /*
	* 用户信息
	*/
    public function userinfo() {
        // 输入参数
        $userId = $_GET['userId'];
        // 输入判断
        $userId = isset($userId) ? $userId : '';
        // 请求参数
        $url_userupdate = "https://bilifun.co/user/userInfo";
        $data = array("userId" => $userId);
		// 请求数据
        $result = Ban::http($url_userupdate, $data);
        $res = json_decode($result);
        
        $this->json([
            'msg' => $res->msg,
            'code' => $res->code,
            'data' => $res->data
        ]);
    }
    /*
	* 用户注册
	*/
    public function userreg() {
        // 输入参数
        $userId = $_GET['userId'];
        $nickName = $_GET['nickName'];
        $tailNumber = $_GET['tailNumber'];
        $confineAlert = $_GET['confineAlert'];
        $pollutionAlert = $_GET['pollutionAlert'];
        // 输入判断
        $userId = isset($userId) ? $userId : '';
        $nickName = isset($nickName) ? $nickName : '';
        $tailNumber = isset($tailNumber) ? $tailNumber : '0';
        $confineAlert = isset($confineAlert) ? $confineAlert : true;
        $pollutionAlert = isset($pollutionAlert) ? $pollutionAlert : true;
        // 请求参数
        $url_userreg = "https://bilifun.co/user/register";
        $data = array("userId" => $userId, "nickName" => $nickName, "tailNumber" => $tailNumber, "confineAlert" => $confineAlert, "pollutionAlert" => $pollutionAlert);
		// 请求数据
        $result = Ban::http($url_userreg, $data);
        $res = json_decode($result);
        // 输出
        $this->json([
            'msg' => $res->msg,
            'code' => $res->code,
            'data' => $res->data
        ]);
    }
    /*
	* 用户更新设置
	*/
    public function setupdate() {
        // 输入参数
        $userId = $_GET['userId'];
        $tailNumber = $_GET['tailNumber'];
        $confineAlert = $_GET['confineAlert'];
        $pollutionAlert = $_GET['pollutionAlert'];
        // 输入判断
        $userId = isset($userId) ? $userId : '';
        $tailNumber = isset($tailNumber) ? $tailNumber : '0';
        $confineAlert = isset($confineAlert) ? $confineAlert : true;
        $pollutionAlert = isset($pollutionAlert) ? $pollutionAlert : true;
        // 请求参数
        $url_userupdate = "https://bilifun.co/user/update";
        $data = array("userId" => $userId, "tailNumber" => $tailNumber, "confineAlert" => $confineAlert, "pollutionAlert" => $pollutionAlert);
		// 请求数据
        $result = Ban::http($url_userupdate, $data);
        $res = json_decode($result);
        // 输出
        $this->json([
            'msg' => $res->msg,
            'code' => $res->code,
            'data' => $res->data
        ]);
    }
    /*
	* 请求数据
	*/
    public function getdata() {
        // 输入参数
        $userId = $_GET['userId'];
        $date = $_GET['date'];
        // 输入判断
        $userId = isset($userId) ? $userId : '';
        $date = isset($date) ? $date : date("Y-m-d");
        // 请求参数
        $url_ban = "https://bilifun.co/alert";
        $data = array("date" => $date, "userId" => $userId);
		// 请求数据
        $result = Ban::http($url_ban, $data);
        $res = json_decode($result);
        // 输出
        $this->json([
            'msg' => $res->msg,
            'code' => $res->code,
            'data' => $res->data
        ]);
    }
}