/*
	Addmefast bot - Script
	(c) 2021 - FreeAngel 
		
		youtube channel : http://www.youtube.com/channel/UC15iFd0nlfG_tEBrt6Qz1NQ
		PLEASE SUBSCRIBE !
		
	github : 
*/

const _MAX_LOADING_WAIT_TIME = 30;
const _TIMEOUT_IN_SECS = 60;
const _MAX_TYPE = 8;

const _ACTION_TYPE_TIKTOK_LIKE = 0;
const _ACTION_TYPE_TIKTOK_FOLLOW = 1;
const _ACTION_TYPE_INSTAGRAM_LIKE = 2;
const _ACTION_TYPE_TWITTER_FOLLOW = 3;
const _ACTION_TYPE_SC_FOLLOW = 4;
const _ACTION_TYPE_SC_LIKE = 5;
const _ACTION_TYPE_YT_SUB = 6;
const _ACTION_TYPE_YT_LIKE = 7;

const _TIKTOK_FOLLOW = "https://www.youlikehits.com/tiktok.php";
const _TIKTOK_LIKE = "https://www.youlikehits.com/tiktoklikes.php";
const _TWITTER_FOLLOW = "https://www.youlikehits.com/twitter2.php";
const _INSTAGRAM_LIKES = "https://www.youlikehits.com/instagramlikes.php";
const _SC_FOLLOW = "https://www.youlikehits.com/soundcloud.php";
const _SC_LIKE = "https://www.youlikehits.com/soundcloudlikes.php";
const _YT_SUB = "https://www.youlikehits.com/youtube2.php";
const _YT_LIKE = "https://www.youlikehits.com/youtubelikes.php";

tick_count = 0;
first = true;

var CurActionUrl = "";

var config = {
	enable : 0,
	max : 0,
	actionType: 0,
}

var tab_id = 0;
var opened_tab_id = 0;
var wait_time = 5;
var task_started_time = 0;	// untuk menandai berapa lama task berlangsung

const _STATE_IDLE = 0;
const _STATE_WAIT = 1; // tidak ngapa2in
const _STATE_TASK_STARTED = 2;
const _STATE_WAIT_TO_CLOSE = 3;  // untuk popup

var state = 0; 	// idle

var click_count = 0;

function clog(s){

		chrome.runtime.sendMessage({action:"log", log: s});
}

var _ENABLE_LIST = [true,true,true,true,true,true,true,true];

function nextActionType(){
	
	// get next enable type
	var i = 0;
	var j = config.actionType;
	var cat = -1;
	while((i < _MAX_TYPE) && (cat == -1)) {
		
		i++;
		if(j < _MAX_TYPE-1) { j++ }
		else { j = 0; }
		
		if(_ENABLE_LIST[j]){
			cat = j;
		}
	}
	
	config.actionType = cat;
	switch(cat) {
		case _ACTION_TYPE_TIKTOK_LIKE : CurActionUrl = _TIKTOK_LIKE;
										break;
		
		case _ACTION_TYPE_TIKTOK_FOLLOW : CurActionUrl = _TIKTOK_FOLLOW;
										  break;
									 
		case _ACTION_TYPE_INSTAGRAM_LIKE : CurActionUrl = _INSTAGRAM_LIKES;
										   break;	

		case _ACTION_TYPE_TWITTER_FOLLOW : CurActionUrl = _TWITTER_FOLLOW;
											 break;
											 
		case _ACTION_TYPE_SC_FOLLOW : CurActionUrl = _SC_FOLLOW;
												break;
												
		case _ACTION_TYPE_SC_LIKE : CurActionUrl = _SC_LIKE;
											break;
		
		case _ACTION_TYPE_YT_SUB : CurActionUrl = _YT_SUB;
			break;
			
		case _ACTION_TYPE_YT_LIKE : CurActionUrl = _YT_LIKE;
			break;
											
		default : CurActionUrl = "";
	}
}

function urlToActionType(vurl){
	
	if(vurl == _TIKTOK_LIKE) return _ACTION_TYPE_TIKTOK_LIKE;
	if(vurl == _TIKTOK_FOLLOW) return _ACTION_TYPE_TIKTOK_FOLLOW;
	if(vurl == _INSTAGRAM_LIKES) return _ACTION_TYPE_INSTAGRAM_LIKE;
	if(vurl == _TWITTER_FOLLOW) return _ACTION_TYPE_TWITTER_FOLLOW;
	if(vurl == _SC_FOLLOW) return _ACTION_TYPE_SC_FOLLOW;
	if(vurl == _SC_LIKE) return _ACTION_TYPE_SC_LIKE;
	if(vurl == _YT_SUB) return _ACTION_TYPE_YT_SUB;
	if(vurl == _YT_LIKE) return _ACTION_TYPE_YT_LIKE;
	return -1;
}

var simulateMouseEvent = function(element, eventName, coordX, coordY) {
	element.dispatchEvent(new MouseEvent(eventName, {
	  view: window,
	  bubbles: true,
	  cancelable: true,
	  clientX: coordX,
	  clientY: coordY,
	  button: 0
	}));
  };
  
  function click(btn){
	  var box = btn.getBoundingClientRect(),
		  coordX = box.left + (box.right - box.left) / 2,
		  coordY = box.top + (box.bottom - box.top) / 2;
		  
	  btn.focus();
	  simulateMouseEvent(btn,"mousemove",coordX,coordY);
	  simulateMouseEvent(btn,"mousedown",coordX,coordY);
	  setTimeout(function(){
		  simulateMouseEvent(btn,"click",coordX,coordY);
		  simulateMouseEvent(btn,"mouseup",coordX,coordY);
	  },200);
  }

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.action === "set") {
		config.enable = request.enable;
		config.max = request.max;
		_ENABLE_LIST[0] = request.tiktoklike;
		_ENABLE_LIST[1] = request.tiktokfollow;
		_ENABLE_LIST[2] = request.iglike;
		_ENABLE_LIST[3] = request.twitterfollow;
		_ENABLE_LIST[4] = request.scfollow;
		_ENABLE_LIST[5] = request.sclike;
		_ENABLE_LIST[6] = request.ytsub;
		_ENABLE_LIST[7] = request.ytlike;

		tick_count = 0;
	}
	
	if (request.action == "opened") {
		
		//tab_id = reqest.ta
		opened_tab_id = request.tabid;
		if(state === _STATE_TASK_STARTED) { wait_time = 300; }
	}

	if (request.action == "closed") {
		
		if(opened_tab_id == request.tabid){
			opened_tab_id = 0;
			if((config.actionType !== _ACTION_TYPE_INSTAGRAM_LIKE) && (config.actionType !== _ACTION_TYPE_TIKTOK_FOLLOW)
			  && (config.actionType !== _ACTION_TYPE_SC_FOLLOW) && (config.actionType !== _ACTION_TYPE_TWITTER_FOLLOW)){
				state = _STATE_IDLE;
			}
			
			wait_time = 3;
		}
	}
	
	
});

function checkReloadButton(){
	
	var div = document.querySelector('div.ui-dialog[aria-labelledby="ui-dialog-title-timeout"]');
	if (!div) { return; }
	
	//document.querySelector('input[name="reload"]').click();	
	var btn = document.querySelector('input[name="reload"]');
	if(btn) {
		
		wait_time = 30;
		clog("Addmefast Page Reloaded");
		btn.click();
	}
}

var loading_tick_count = 0;

function isLoading(){
	// <img src="ajax-loader.gif">
	var img = document.querySelector('img[src="ajax-loader.gif"]');
	if(img) { loading_tick_count++; return true; }
	else { loading_tick_count = 0; return false; }
}

function core_ig_like(){
	
	//<a href="javascript:void(0);" onclick="likepage(114702,'CV2qzGYMjIp');" class="followbutton">Like</a>
	if(state == _STATE_IDLE){
		var btn = document.querySelector('a.followbutton');
		if(btn) {
			btn.click();
			wait_time = 10;
			return;
		}
		
		btn = document.querySelector('a.likebutton');
		
		if(!btn) {
					
			console.log("No Button Found !");
			nextActionType();
			state = _STATE_WAIT;
			wait_time = 30;
			window.location.href = CurActionUrl;
			return;
		}
		
		if(btn.getAttribute("signed") === "1"){
			// already clicked
			console.log("already clicked");
			// check for skip button
			var a = document.querySelector('a[onclick^="FBSkip("]');
			if(a){
				state = _STATE_IDLE;
				wait_time = 5;
				console.log("skipped ...");
				a.click();
			}
			return;
		}
		
		wait_time = 120;
		state = _STATE_TASK_STARTED;
		click_count++;
		task_started_time = 0;
		chrome.runtime.sendMessage({action:"setActType",actType:config.actionType});
		btn.setAttribute("signed","1");
		btn.click();
		console.log("liked, state : "+state);
		return;
	}
	
	if(state == _STATE_TASK_STARTED) {
		// check for confirm button
		var btn = document.querySelector('button[onclick="checkDoesLike();"]');
		if(!btn){
			state = _STATE_IDLE;
			wait_time = 5;
			console.log("Confirm Button Not Found !");
			return;
		}
		
		wait_time = 5;
		btn.click();
		state = _STATE_IDLE;
	}
}

function core_tiktok_follow(){

	//display: none;
	var charts = document.querySelectorAll('div[class^="follow"]');
	if((!charts) || (charts.length < 1)){
		console.log("No Chart found !");
		nextActionType();
		state = _STATE_WAIT;
		wait_time = 30;
		window.location.href = CurActionUrl;
		return;		
	}
	
	var chart = null;
	for(var i=0; i<charts.length; i++){
		if(charts[i].getAttribute("style") !== "display: none;") {
			chart = charts[i];
			break;
		}
	}
	
	//var chart = document.querySelector('div[class^="follow"]');
	if(!chart){
		console.log("No Chart found !");
		nextActionType();
		state = _STATE_WAIT;
		wait_time = 30;
		window.location.href = CurActionUrl;
		return;		
	}

	if(state == _STATE_IDLE){
		
		// check if this chart already clicked
		if(chart.getAttribute("signed") === "1"){
		
			console.log("already clicked");
			// skip it
			var a = chart.querySelector('a[onclick^="skipuser("]');
			if(a){
				console.log("skipped");
				a.click();
			}
			
			wait_time = 5;
			return;
		}
		
		var area = chart.querySelector('area[onclick^="window.open("]');
		if(!area){
			console.log("No follow area Found !");
			nextActionType();
			state = _STATE_WAIT;
			wait_time = 30;
			window.location.href = CurActionUrl;
			return;			
		}
		
		chart.setAttribute("signed","1");
		wait_time = 120;
		state = _STATE_TASK_STARTED;
		click_count++;
		task_started_time = 0;
		area.click();
		chrome.runtime.sendMessage({action:"setActType",actType:config.actionType});		
		return;
	}
	
	if(state == _STATE_TASK_STARTED){

		var area = chart.querySelector('area[onclick^="followuser("]');
		if(!area){
			console.log("No confirm area Found !");
			nextActionType();
			state = _STATE_WAIT;
			wait_time = 30;
			window.location.href = CurActionUrl;
			return;			
		}
		
		wait_time = 5;
		area.click();
		state = _STATE_IDLE;		
	}
	
}

function core_sc_follow(){

	//display: none;
	var charts = document.querySelectorAll('div[class^="follow"]');
	if((!charts) || (charts.length < 1)){
		console.log("No Chart found !");
		nextActionType();
		state = _STATE_WAIT;
		wait_time = 30;
		window.location.href = CurActionUrl;
		return;		
	}
	
	var chart = null;
	for(var i=0; i<charts.length; i++){
		if(charts[i].getAttribute("style") !== "display: none;") {
			chart = charts[i];
			break;
		}
	}
	
	//var chart = document.querySelector('div[class^="follow"]');
	if(!chart){
		console.log("No Chart found !");
		nextActionType();
		state = _STATE_WAIT;
		wait_time = 30;
		window.location.href = CurActionUrl;
		return;		
	}

	if(state == _STATE_IDLE){
		
		// check if this chart already clicked
		if(chart.getAttribute("signed") === "1"){
		
			console.log("already clicked");
			// skip it
			var a = chart.querySelector('a[onclick^="skipuser("]');
			if(a){
				console.log("skipped");
				a.click();
			}
			
			wait_time = 5;
			return;
		}
		
		var area = chart.querySelector('a[onclick^="window.open("]');
		if(!area){
			console.log("No a follow Found !");
			nextActionType();
			state = _STATE_WAIT;
			wait_time = 30;
			window.location.href = CurActionUrl;
			return;			
		}
		
		chart.setAttribute("signed","1");
		wait_time = 120;
		state = _STATE_TASK_STARTED;
		click_count++;
		task_started_time = 0;
		area.click();
		chrome.runtime.sendMessage({action:"setActType",actType:config.actionType});		
		return;
	}
	
	if(state == _STATE_TASK_STARTED){

		var area = chart.querySelector('a[onclick^="followuser("]');
		if(!area){
			console.log("No a confirm Found !");
			nextActionType();
			state = _STATE_WAIT;
			wait_time = 30;
			window.location.href = CurActionUrl;
			return;			
		}
		
		wait_time = 5;
		area.click();
		state = _STATE_IDLE;		
	}
	
}
 	   var readyStateCheckInterval = setInterval(function() {
	       
		   if (document.readyState !== "complete") { return; }

		   if(first){
				first = false;
				chrome.runtime.sendMessage({action: "get"}, function(response){
	
					config.enable = response.enable;
					config.max = response.max;
					_ENABLE_LIST[0] = response.tiktoklike;
					_ENABLE_LIST[1] = response.tiktokfollow;
					_ENABLE_LIST[2] = response.iglike;
					_ENABLE_LIST[3] = response.twitterfollow;
					_ENABLE_LIST[4] = response.scfollow;
					_ENABLE_LIST[5] = response.sclike;
					_ENABLE_LIST[6] = response.ytsub;
					_ENABLE_LIST[7] = response.ytlike;
					
					config.actionType = response.actType;
					tab_id = response.tabid;
				});
		   }

		   if(!config.enable) { return; }
		   
		   cur_url = //$(location).attr('href');		   
					 window.location.href;

           tick_count= tick_count+1; 


		   if(state === _STATE_WAIT_TO_CLOSE){
			
				
				if(wait_time > 0){
					console.log("closing windows in "+wait_time+" seconds");
					wait_time--;
				} else { window.close(); }
				return;
		   }

		   if(cur_url.indexOf("tiktok.com") !== -1){
				do_tiktok();
				return;
		   }

		   if(cur_url.indexOf("instagram.com") !== -1){
				do_instagram();
				return;
		   }
		   
		   if(cur_url.indexOf("soundcloud.com") !== -1){
			   do_soundcloud();
			   return;
		   }
		   
		   if(cur_url.indexOf("twitter.com") !== -1){
			   do_twitter();
			   return;
		   }
		   
		   if(cur_url.indexOf("youtube.com") !== -1){
			   do_youtube();
			   return;
		   }
		   
		   if(cur_url.indexOf("youlikehits.com") === -1) { return; }
		   
		   if(isLoading()){
			
				console.log("waiting ...");
				if(loading_tick_count >= _MAX_LOADING_WAIT_TIME){
					console.log("wait timeout, next type");
					nextActionType();
					state = _STATE_WAIT;
					wait_time = 30;
					window.location.href = CurActionUrl;
				}
				
				return;
		   }

		   console.log("state : "+state);
		   if(wait_time > 0){
			    // sedang dalam proses menanti
				wait_time--;
				return;
		   }

		   var cat = urlToActionType(cur_url);
		   if(cat === -1){
			   // disable
				console.log("unknown url, get next type");
				nextActionType();
				state = _STATE_WAIT;
				wait_time = 30;
				window.location.href = CurActionUrl;
			   return;
		   }
		   
		   // addmefast often error and ask to reload
//		   checkReloadButton();
		   
		   if(config.actionType != cat){
			
			  chrome.runtime.sendMessage({action:"setActType",actType:cat});
		   }
		   
   		   config.actionType = cat;

/*		   if(state === _STATE_WAIT){
			   
			   // reload page because it's error
			   window.location.href = cur_url;
			   return;
		   }
*/		   
		   if(state == _STATE_TASK_STARTED){
			   if(task_started_time > _TIMEOUT_IN_SECS){
				   console.log("task timeout ...");
				   wait_time = 10;
				   window.location.href = cur_url;
				   return;
			   }
			   
			   task_started_time++;
		   }
		   
		   if(state === _STATE_IDLE){

			   // check for maxType
				if(click_count >= config.max){
					console.log("MaxClick "+click_count+", next type");
					nextActionType();
					state = _STATE_WAIT;
					wait_time = 30;
					window.location.href = CurActionUrl;
					return;
				}
		   }
		   
		   switch(config.actionType) {
			   case _ACTION_TYPE_YT_LIKE:
			   case _ACTION_TYPE_YT_SUB :
			   case _ACTION_TYPE_TIKTOK_LIKE :
			   case _ACTION_TYPE_SC_LIKE :
			   case _ACTION_TYPE_INSTAGRAM_LIKE :
				   core_ig_like();
				   break;
				   
			   case _ACTION_TYPE_TIKTOK_FOLLOW:
				   core_tiktok_follow();
				   break;
				   
			   case _ACTION_TYPE_TWITTER_FOLLOW :
			   case _ACTION_TYPE_SC_FOLLOW :
				   core_sc_follow();
				   break;
		   }
		   
		   
	 }, 1000);

