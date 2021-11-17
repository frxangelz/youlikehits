var config = {
	enable : 0,
	max : 0,
	iglike: false,
	twitterfollow: false,
	tiktoklike: false,
	tiktokfollow: false,
	scfollow: false,
	sclike: false,
	ytsub: false,
	ytlike: false
}

$(document).ready(function(){
	$("btn#start").click(function(){
		var txt = $(this).text();
		if (txt==="Start"){

			config.max = $('#maxclick').val();
			config.iglike = $("#iglike").is(":checked");
			config.twitterfollow = $("#twitterfollow").is(":checked");
			config.tiktoklike = $("#tiktoklike").is(":checked");
			config.tiktokfollow = $("#tiktokfollow").is(":checked");
			config.scfollow = $("#scfollow").is(":checked");
			config.sclike = $("#sclike").is(":checked");
			config.ytsub = $("#ytsub").is(":checked");
			config.ytlike = $("#ytlike").is(":checked");

			if((!config.iglike) && (!config.twitterfollow) && (!config.tiktoklike) && (!config.tiktokfollow) && (!config.sclike) && 
			   (!config.scfollow) && (!config.ytsub) && (!config.ytlike)){
				return;
			}

			config.enable = 1;
			$(this).text("Stop");
			$(this).removeClass("btn-success");
			$(this).addClass("btn-danger");
			
			chrome.storage.sync.set({max:config.max, iglike: config.iglike, twitterfollow: config.twitterfollow, tiktoklike:config.tiktoklike,
									tiktokfollow:config.tiktokfollow, scfollow:config.scfollow,sclike:config.sclike,
									ytsub:config.ytsub, ytlike:config.ytlike});
			
		} else {
			$(this).text("Start");
			$(this).removeClass("btn-danger");
			$(this).addClass("btn-success");
			config.enable = 0;
		}

		set_status();
		EnableControl(config.enable ? true:false);

	});
	
	get_status();
	//setInterval(get_status,1000);
});	

function set_status(){
	
	chrome.runtime.sendMessage({action: "set",
			enable: config.enable,
			max: config.max,
			iglike: config.iglike,
			twitterfollow: config.twitterfollow,
			tiktoklike: config.tiktoklike,
			tiktokfollow: config.tiktokfollow,
			scfollow: config.scfollow,
			sclike: config.sclike,
			ytsub: config.ytsub,
			ytlike: config.ytlike
		}, function(response){});		

}

function get_status(){
	var $b = $("btn#start");

	chrome.runtime.sendMessage({action: "get"}, function(response){
	
		config.enable = response.enable;
		config.max = response.max;
		config.iglike = response.iglike;
		config.twitterfollow = response.twitterfollow;
		config.tiktoklike = response.tiktoklike;
		config.tiktokfollow = response.tiktokfollow;
		config.scfollow = response.scfollow;
		config.sclike = response.sclike;
		config.ytsub = response.ytsub;
		config.ytlike = response.ytlike;
		
		if (config.enable == 0){
			$b.text("Start");
			$b.removeClass("btn-danger");
			$b.addClass("btn-success");
		} else {
			$b.text("Stop");
			$b.removeClass("btn-success");
			$b.addClass("btn-danger");
		}
		
		$('#maxclick').val(config.max);
		$('#iglike').prop("checked",config.iglike);
		$('#twitterfollow').prop("checked",config.twitterfollow);
		$('#tiktoklike').prop("checked",config.tiktoklike);
		$('#tiktokfollow').prop("checked",config.tiktokfollow);
		$('#scfollow').prop("checked",config.scfollow);
		$('#sclike').prop("checked",config.sclike);
		$('#ytsub').prop("checked",config.ytsub);
		$('#ytlike').prop("checked",config.ytlike);
		
		EnableControl(config.enable ? true:false);
	});
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

	if(request.action === "count"){
		$("btn#count").text(request.value);
		if(request.enable != 1){
		  var $b = $("btn#start");
		  $b.removeClass("btn-danger");
		  $b.addClass("btn-success");
		  $b.text("Start");
		}
		return;
	}
});

function EnableControl(val){
		$('#maxclick').prop("disabled",val);
		$('#iglike').prop("disabled",val);
		$('#twitterfollow').prop("disabled",val);
		$('#tiktoklike').prop("disabled",val);
		$('#tiktokfollow').prop("disabled",val);
		$('#scfollow').prop("disabled",val);
		$('#sclike').prop("disabled",val);
		$('#ytsub').prop("disabled",val);
		$('#ytlike').prop("disabled",val);
}