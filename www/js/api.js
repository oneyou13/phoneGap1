var AJAXURL = "http://192.168.10.134";
// var AJAXURL = "http://www.boya88888.com"; //正式地址
document.documentElement.style.fontSize =document.documentElement.clientWidth / 37.5 + 'px';
window.addEventListener("resize",function(){
	document.documentElement.style.fontSize =document.documentElement.clientWidth / 37.5+ 'px';
});
(function(window){
    var u = {};
    var isAndroid = (/android/gi).test(navigator.appVersion);
    var uzStorage = function(){
        return window.localStorage;
    };
    u.setStorage = function(key, value){
        if(arguments.length === 2){
            var v = value;
            if(typeof v == 'object'){
                v = JSON.stringify(v);
                v = 'obj-'+ v;
            }else{
                v = 'str-'+ v;
            }
            var ls = uzStorage();
            if(ls){
                ls.setItem(key, v);
            }
        }
    };
    u.getStorage = function(key){
        var ls = uzStorage();
        if(ls){
            var v = ls.getItem(key);
            if(!v){return;}
            if(v.indexOf('obj-') === 0){
                v = v.slice(4);
                return JSON.parse(v);
            }else if(v.indexOf('str-') === 0){
                return v.slice(4);
            }
        }
    };
    u.rmStorage = function(key){
        var ls = uzStorage();
        if(ls && key){
            ls.removeItem(key);
        }
    };
    u.clearStorage = function(){
        var ls = uzStorage();
        if(ls){
            ls.clear();
        }
    };
/*end*/
    window.$api = u;
})(window);
function coypWeixin(){
	var content = "boyayule001";
	var aux = document.createElement("textarea");
	// 获取复制内容
	aux.value = content;
	// 将元素插入页面进行调用
	document.body.appendChild(aux);
	// 复制内容
	aux.select();
	document.execCommand("selectAll");
	// 将内容复制到剪贴板
	document.execCommand("cut");
	//    // 删除创建元素
	document.body.removeChild(aux);
	alert("复制成功!")
}
function parseQueryString(){ //解析地址的参数,
	var url = decodeURIComponent(window.location.href); 
	if(url.split("?").length!=2){
		return {};
	}
    var str=url.split("?")[1],
    items=str.split("&");
    var arr,name,value;
	var willReturn={};
    for(var i = 0, l = items.length; i < l; i++){
        arr=items[i].split("=");
        name= arr[0];
        value= arr[1];
        willReturn[name]=value;
    }
	return willReturn;
}
window.onerror=function(){ //监听错误，中止流
	if(arguments[0].indexOf('未登录')!=-1){ //未登录
		window.location.href = "/login.html"
	}
	if(arguments[0].indexOf('登陆信息异常')!=-1){ //登陆信息异常
		alert("请登录!")
		window.location.href = "/login.html"
	}
	return true   //不弹出错误提示.
};
Vue.config.errorHandler = function (err, vm, info) {
	console.error(err)
	window.onerror(err.toString())
	return false
}
//公共的处理err
function alertErr(err){
	var willAlert = "";
	if(err&&err.errors){
		for(var x in err.errors){
			willAlert+=JSON.stringify(err.errors[x]).replace(/[\[|\]|\,| |"]/g,'')+"\n"
		}
		alert(willAlert)
	}else{
		alert(err.message)
	}
}
function dataAddDoit(data){
	data=parseInt(data)
	data = data+'';
	var willReurn = ''
	for (var i=data.length-1;i>=0;i--){
		willReurn=data[i]+""+willReurn
		if((data.length-i)%3 == 0&&i!=0){
			willReurn=","+willReurn
		}else{
			
		}
	}
	return willReurn
}
function checkLoginStatus(params){ //
    params = Object.assign({
		name:"login",
		showModel:false,//是否直接跳转,true会提示是否登陆，false，则不会提示直接跳转。
		onlyStatus:false,//这个优先级最高，直接返回是否值
	},params||{});
	switch (params.name){
		case "login":
			 if(params.onlyStatus==true){
				 return !!$api.getStorage("token")
			 }
			 if(params.showModel==false){
				 if(!$api.getStorage("token")){//没有登陆信息
					 $api.rmStorage("token"); //删除
					 throw new Error("未登录")
				 }
			 }
			 if(params.showModel==true){
			 	if(!$api.getStorage("token")){//没有登陆信息
					
			 	}			 
			 }
			break;
		default:
			break;
	}
}
//刷新token
function refreshToken(){
	var token = $api.getStorage("token");
	if(typeof token == 'undefined'){ //token过期时间不存在,表示没有登陆
		throw new Error("登陆信息异常")
	}else{
		if(Date.parse(token.expired_at.replace(/-/g,"/")||0) < ((new Date()).getTime()+1000*60*10)){ //验证token,提前10分钟验证
			$.ajax({
			    url: AJAXURL+'/api/authorizations/current',
			    type: "PUT",
			    data:{
				},
				async:false,
				headers:{
					"Authorization":"Bearer " + ($api.getStorage("token")||{}).token
				},
				success:function(data){
					$api.setStorage("token",data);
				},
				error:function(data){
					$api.rmStorage("token");
					throw new Error("登陆信息异常")
				}
			});
		}
	}
}
// params {url,method,data:{values}},
// cb回调函数
// needCheckToken是否需要传token 0/false/undefine 表示不需要token，1/true表示需要且会直接跳转，2表示需要不会直接跳转
function apiajax(params,cb,needCheckToken,showError){
	if(typeof(showError)=="undefined"){
		showError = true; //默认会出现
	}
	if(!!needCheckToken){ //是否需要检查token
		if(!$api.getStorage("token")){
			if(needCheckToken==2){
				return
			}else{
				throw new Error("登陆信息异常")
				return
			}
		}else{
			refreshToken();//验证token是否需要刷新。
			params.headers={
				"Authorization":"Bearer " + ($api.getStorage("token")||{}).token
			}
		}
	}
	if(params.url.indexOf("http")==-1){
		params.url=AJAXURL+params.url
	}
	if(typeof params.async == "undefined"){
		params.async = true;
	}
	$.ajax({
	    url: params.url||'',
	    type: params.method||'get',
	    data:params.data.values||{},
		headers:params.headers||{},
		success:function(data){
			cb(data,{})
		},
		async:params.async,
		error:function(data){
			var cbData = "";
			try{
				cbData = JSON.parse(data.response);//解析成JSON失败
			}catch(e){
				cbData = data.response; //只返回数字,或者字符串
			}
			if(typeof cbData == "object"){
				if(cbData.message=="Unable to authenticate with invalid token."){ //token出现异常
					$api.rmStorage("token");
					throw new Error("登陆信息异常")
				}
				if(cbData.message=="Token Signature could not be verified."){ //token出现异常
					$api.rmStorage("token");
					throw new Error("登陆信息异常")
				}
				if(showError){
					setTimeout(function(){
						alertErr(cbData)
					});
				}
			}
			cb({},cbData)
		}
	});
}
window.addEventListener('pageshow', function (e) {
	 if (e.persisted) {
		 window.location.reload()
	 }
});
function apicloseWin(){
   window.history.go(-1);
};
//组件footer-vue
Vue.component("foot-vue",{
	data:function(){
		return {
			callKefu:false,
			title:['首页','优惠','客服','我的'],
			active:['images/main/main.png',"images/main/chouma(1).png","images/main/kefu(1).png","images/main/icon_user.png"],
			unactive:['images/main/un_main.png',"images/main/chouma.png","images/main/kefu.png","images/main/uesr.png"],
		}
	},
	props:{
		'index':{
			type:Number,
			default:0,
		},
		'path':{
			type:String,
			default:"",
		},
	},
	template:'<div class="d-wb wb-c h-49 bc-0B102A"> \
				<div v-for="ret in 4" @click="switchIndex(ret-1)" class="wbf-1 h-49 d-wb wb-c wbo-v"> \
					<img v-if="index==(ret-1)" v-bind:src="path+active[(ret-1)]" class="w-15"/> \
					<img v-else v-bind:src="path+unactive[(ret-1)]" class="w-15"/> \
					<div v-if="index==(ret-1)" class="c-CCAC67 fs-10 mt-3"> \
						{{title[(ret-1)]}} \
					</div> \
					<div v-else class="c-666666 fs-10 mt-3"> \
						{{title[(ret-1)]}} \
					</div> \
				</div> \
				<div v-if="callKefu" class="p-f w100 h100 d-wb wbo-v wb-c l-0 t-0 bc-00000000075 zi-999"> \
					<div class="w-300 h-360 bs-c d-wb wbo-v bc-fff br-5 o-h"> \
						<div class="h-320 d-wb  wbp-c"> \
							<div class="w-123"> \
								<img v-bind:src="path+\'images/user/img_kef@2x.png\'" class="w-123 h-320"> \
							</div> \
							<div class="wbf-1"> \
								<div class="h-50"> \
									 \
								</div> \
								<div class="fs-10 c-212121"> \
									请联系客服 \
								</div> \
								<div class="fs-14 c-212121 mt-5"> \
									客服联系方式： \
								</div> \
								<div class="d-wb wba-c bc-464059 br-5 h-40 w-155 mt-24"> \
									<div class="ml-3 mr-3"> \
										<img  v-bind:src="path+\'images/user/xiugaimima/icon_QQ.png\'" class="h-28 w-28"/>	 \
									</div> \
									<div class="wbf-1 d-wb wbo-v wbp-c fs-14 c-fff pl-1"> \
										<div class="d-wb wba-c"> \
											客服QQ: \
										</div> \
										<div class="d-wb wba-c"> \
											152323323 \
										</div> \
									</div> \
								</div> \
								<div class="d-wb wba-c bc-464059 br-5 h-40 w-155 mt-10"> \
									<div class="ml-3 mr-3"> \
										<img v-bind:src="path+\'images/user/xiugaimima/dianhua.png\'" class="h-28 w-28"/>	 \
									</div> \
									<div class="wbf-1 d-wb wbo-v wbp-c fs-14 c-fff pl-1"> \
										<div class="d-wb wba-c"> \
											客服电话: \
										</div> \
										<div class="d-wb wba-c"> \
											158 8688 9688 \
										</div> \
									</div> \
								</div> \
								<div class="d-wb wba-c mt-31 ml-7"> \
									<img v-bind:src="path+\'images/user/weixin@2x.png\'" class="h-15" > \
									<div class="fs-14 c-212121 fw-800 ml-6"> \
										微信客服 \
									</div> \
								</div> \
								<div onclick="coypWeixin()" class="d-wb wba-c mt-9 ml-7"> \
									<div class="fs-14 c-212121"> \
										boyayule001 \
									</div> \
									<div class="fs-10 c-212121 fw-800 ml-6 w-67 bs-c d-wb wbp-e" :style="{\'background-image\': \'url(\'+path+\'images/user/duobian@2x.png)\'}"> \
										复制微信号 \
									</div> \
								</div> \
							</div> \
						</div> \
						<div @click="callKefu = !callKefu" class="h-40 bc-CCAC67 fs-15 fw-800 d-wb wb-c"> \
							关闭 \
						</div> \
					</div> \
				</div> \
			</div>',
	methods:{
		switchIndex:function(index){
			if(index==2){
				this.callKefu =!this.callKefu;
			}else{
				this.$emit("update:index",index);
				switch (index){
					case 0:
						window.location.href = "/main.html"
						break;
					case 1:
						window.location.href = "/youhuihuodong.html"
						break;
					case 2:
						break;
					case 3:
						checkLoginStatus();
						window.location.href = "/user/index.html"
						break;
					default:
						break;
				}
			}
		}
	}
});
//组件header-vue
Vue.component("header-vue",{
	data:function(){
		return {}
	},
	props:{
		"title":{
			type: String,
			default: "",
		},
		"theme":{
			type: String,
			default: "back",
		},
		"path":{
			type: String,
			default: "default",
		},
	},
	template:'<div v-if="theme==\'back\'" class="d-wb wba-c h-44 fw-800 bc-0B102A"> \
				<div class="h-44 w-44 d-wb wb-c" onclick="apicloseWin()"> \
					<img v-bind:src="path+\'images/main/icon_arrow_white@2x.png\'" class="h-18"/> \
				</div> \
				<div class="wbf-1 d-wb wb-c fs-18 c-fff"> \
					{{title}} \
				</div> \
				<div @click="right_click" class="h-44 w-44 d-wb wb-c"> \
					<slot name="right"></slot>\
				</div> \
			</div>\
			<div v-else class="d-wb wba-c h-44 fw-800"> \
				<div class="h-44 w-44 d-wb wb-c" onclick="apicloseWin()">\
					<img v-bind:src="path+\'images/zhenrenshixun/icon_arrow@2x.png\'" class="w-22"/>\
				</div>\
				<div class="wbf-1 d-wb wb-c fs-18 c-000">\
					{{title}}\
				</div>\
				<div @click="right_click" class="h-44 w-44 d-wb wb-c">\
					<slot name="right"></slot>\
				</div>\
			</div>',
	methods:{
		right_click:function(){
			this.$emit("right_click",{})
		}
	},
	mounted:function(){
		if(this.path == "default"){
			if(this.theme=="back"){
				this.path="../"
			}else{
				this.path=""
			}
		}
	}
});