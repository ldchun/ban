<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use \QCloud_WeApp_SDK\Auth\LoginService as LoginService;
use QCloud_WeApp_SDK\Constants as Constants;

class Notice extends CI_Controller {
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
	* POST请求
	*/
	public function http_post( $url, $data ) {
		$options = array(
			'http' => array(
				'method'  => 'POST',
				'header'  => 'Content-type:application/json', //header 需要设置为 JSON
				'content' => $data,
				'timeout' => 60 //超时时间
			)
		);
		$context = stream_context_create( $options );
		$result = file_get_contents( $url, false, $context );
		return $result;
	}
    /*
	* 解码userId取出opendid
	*/
    public function getOpenid($userId) {
        // 用户userId
        $id_length = strlen($userId);
        $cut_index = ($id_length > 10) ? 10 : 5;
        $cut_index = $id_length - $cut_index;
        // 前后调转取出openid
        $idfront = substr($userId, 0, $cut_index);
        $idend = substr($userId, $cut_index);
        $openid = $idend . $idfront;
        return $openid;
    }
	/*
	* 获取 access_token
	*/
    public function getAccessToken() {
        $url_token = "https://api.weixin.qq.com/cgi-bin/token";
        $data = array( 
			"appid" => 'wx251a2f2703a415d6', 
			"secret" => '1aa108ab34bb8eadd4c620564ffde846', 
			"grant_type" => "client_credential"
			);
        $result = Notice::http($url_token, $data);
        $res = json_decode($result);
        return $res->access_token;
    }
    /*
	* 保存formIds
	*/
    public function saveFormIds() {
        // 输入参数
        $userId = $_GET['userId'];
        $formIds = $_GET['formIds'];
        // 输入判断
        $userId = isset($userId) ? $userId : '';
        $formIds = isset($formIds) ? $formIds : '';
        // 请求参数
        $openid = Notice::getOpenid($userId);
        $formId_arr = explode(',', $formIds);
        return ;
    }
    /*
	* 发送消息
	*/
    public function sendmsg() {
        $tempid_arr = array(
            "ban" => "BpW4GwiAExKoRN5rRnT79KTD-_WYrppz1w4K7KD-ey0",
            "opll" => "BpW4GwiAExKoRN5rRnT79KTD-_WYrppz1w4K7KD-ey0"
        );
        // 输入参数
        $userId = $_GET['userId'];
        $formId = $_GET['formId'];
        $type = $_GET['type'];
        // 输入判断
        $userId = isset($userId) ? $userId : '';
        $formId = isset($formId) ? $formId : '';
        $type = isset($type) ? $type : 'ban';
        // 请求参数
        $access_token = Notice::getAccessToken();
        $openid = Notice::getOpenid($userId);
        $url = "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=" . $access_token;
        // 模板消息数据
        $template_data = array(
            'keyword1' => array( "value" => "成都市应急启动重污染天气黄色预警", "color" => "#173177" ),
            'keyword2' => array( "value" => "限行模式由鸳鸯锅变红锅,现行区域：绕城(含)以内", "color" => "#FF0000" )
        );
        $post_data = array(
            "page" => "/pages/index/index",
            "touser" => $openid,
            "template_id" => $tempid_arr[$type],
            "form_id" => $formId,
            "data" => $template_data
        );
        $data = json_encode($post_data, true);
        // 请求数据
        $return = Notice::http_post( $url, $data);
        $res = json_decode($result);
        // 输出
        $this->json([
            'data' => $res
        ]);
    }
}