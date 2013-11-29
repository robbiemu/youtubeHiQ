var debugKeys = {"level": ["off", "event", "function", "timeouts"], "detail": ["minimal", "detailed"]};
var debug = { "level": "off", "state": "minimal" };

function debug(options) {
    if (options["level"].length > 0) {
        if (verifyDebugValue("level", options["level"] == false) 
            return
    }
    if (options["detail"].length > 0) {
        if (verifyDebugValue("detail", options["detail"] == false)
            return
    }

    console.log(options["msg"]);
}

function verifyDebugValue(lval, rval){
    var state = 10; // sufficiently high
    for (k in debugKeys[lval]) {
        if (debugKeys[lval][k] == rval) {
            return true;
        }
        if (k >= debug[lval]) { // rval was greater than debug key
            return false;
        }
    }

}

window.addEventListener("message", function (event) {
    if (event.source != window)
        return;

    if (event.data.type && (event.data.type == "changeSize")) {
        pollToChangeSize();
    }
}, false);

function pollToChangeSize() {
    debug({"level": "event", "msg": "changeSize.js changeSize() - Event - message injected into matching page recieved"});

    if ($("#player-api embed").length > 0) {
        waitOnElement({"secs": 200, "type": "Flash"});
    } else {
        waitOnElement({"secs": 200, "type": "HTML5");
    }
}

function waitOnElement(options) { // the DOM doesn't instantiate everyting all at once sometimes
    debug({"level": "timeouts", "msg": "changeSize.js waitOnElement timeout"});

    var recall = false;

    if (options["type"] == "Flash") {
        for (method in $("#player-api embed")) 
            1;

        if ($("#player-api embed").length == 0) {
            recall = true;
        }
    }
    else { // type == "HTML5"
        if (typeof $("#player-api video").get(0).videoHeight == undefined) {
            recall = true;
        }
        else {
            $("#player-api video, #movie_player, #player-api, #player, .html5-video-container").css("zoom", "reset");
            $(".html5-video-controls").css("zoom", window.devicePixelRatio);
        }
    }
    if (recall) {
        setTimeout(waitOnElement, options["secs"], {"secs": options["secs"], "type": options["type"]});
    }
    else {
        $("#player, #playlist, #watch7-playlist-tray-container").css("zoom", "reset"); // some one-time css (per video)

        watchViewport({ "type": options["type"], "last_width": 0 });
    }
}

function watchViewport(vp) { // not knowing how to always catch when the video has reloaded without the page reloading, so poll the page
    debug({"level": "timeouts", "msg": "changeSize.js watchViewport timeout"});

    var element = "";
    var videoWidth = 0;
    var videoHeight = 0;

    if (vp["type"] == "HTML5") {
        element = "#player-api video";
        videoWidth = $(element).get(0).videoWidth;
        videoHeight = $(element).get(0).videoHeight;
    }
    else if (vp["type"] == "Flash") {
        element = "#player-api embed";
        var wh = $(element).attr("flashvars").match(/adaptive_fmts=.*?size\%3D(.\d+)x(.\d+)/);
        videoWidth = wh[1];
        videoHeight = wh[2];
    }

    if ($(element).length == 0){ // for when someone skips videos from a playlist and the next video is back to flash/html5
        pollToChangeSize();
        return;
    }

    var last_width = vp["last_width"];

    if (last_width != videoWidth) {
        if (sufficientWindow([null, videoWidth, videoHeight ])) {
            changeSize({"type": vp["type"], "width": videoWidth, "height": videoHeight});
        }
    }

    vp["last_width"] = videoWidth;
    setTimeout(watchViewport, 200, vp);
}

function changeSize(options) {
    debug({"level": "functions", "state": "detailed", "msg": "changeSize.js changeSize()"});

    if (options["type"] == "Flash") {
        options["playbarHeight"] = $('.watch7-playlist-bar').outerHeight();
        options["controlsOffset"] = playbarHeight; //determined in flash
    }
    else if (options["type"] == "Flash") {
        options["playbarlistOffset"] = $("#playlist").outerHeight();
        options["controlsOffset"] = $(".html5-video-controls").outerHeight();//might need to factor zoom???
    }

    changeViewport(options);
    changePlaylistbar(options);
    changePlaylist(options);
    changeLayout(options);
}

function changeViewport(options) {
    debug({"level": "functions", "msg": "changeSize.js changeViewport()"});

    if (options["type"] == "Flash") {
        $("#player-api, #player-api embed, #player").width(options["width"]).height(options["height"]);
        $("#player-api").height(options["height"] + playbarHeight);
        $("#player").height(options["height"] + playbarHeight + controlsOffset);
        $("#player-api").css("zoom", "reset");
    } 
    else if (type == "HTML5") {
        var video = $("#player-api video").get(0);
        for (method in video) { 1; } // ensure all methods are loaded up

        var vw = video.videoWidth + 'px';
        var vh = video.videoHeight + controlsOffset + 'px'; // the video object only needs to provide layout space for the one following bar (playback controls)

        lowLevelCSS("#player-api video", { "attr": "width", "val": vw });
        lowLevelCSS("#player-api video", { "attr": "height", "val": vh });
        $("#player-api video").attr('height', vh).attr('width', vw);

        vh = video.videoHeight + controlsOffset + 'px'; // the containers need to provide space for both the playback controls and the playlist

        $(".html5-video-container, #player-api, #player").css({ "width": vw, "height": vh });

        lowLevelCSS("#movie_player", { "attr": "width", "val": vw });
        lowLevelCSS("#movie_player", { "attr": "height", "val": vh });
    }
}

function sufficientWindow(wh) {
    debug({"level": "function", "state": "detailed", "msg": "changeSize.js mins()"});   

    if (wh) {
        if ((wh[1] > window.screen.width)) {
            return false;
        }
        if ((wh[2] > window.screen.height)) {
            return false;
        }
        return true;
    } else {
        return false;
    }
}