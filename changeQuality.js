//currently changeQuality.js is broken. edit this same code in yt.js instead

function changeQuality(player) {
    var quality_opt = ['highres', 'hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium', 'small', 'tiny', 'default'];
	if(typeof player.getPlayerState !== 'undefined' && player.getPlayerState() >= 0){
		player.pauseVideo();
		var levels = player.getAvailableQualityLevels();
		if(levels.length <= 0){ //Sometimes in HTML5 players the api isn't ready, even though it should be.
			setTimeout(function(){changeQuality(player);},200);
			return;
		}
		for(var i = 0; i < 10; i++){
			if(levels.indexOf(quality_opt[i]) >=0 ){
			    player.setPlaybackQuality(quality_opt[i]);
			    window.postMessage({ type: "changeSize", text: "changeSize" }, "*"); // calls eventListener in changeSize.js
				break;
			}
		}
		player.playVideo();
	}
	else{
		setTimeout(function(){changeQuality(player);},200);
	}
}

function onYouTubePlayerReady(player){
    setTimeout(function () { changeQuality(player); }, 200);
}