window.addEventListener("message", function (event) {
    if (event.source != window)
        return;

    if (event.data.type && (event.data.type == "changeSize")) {
        pollToChangeSize();
    }
}, false);

function pollToChangeSize() {
    debug({ "level": "event", "msg": "changeSize.js changeSize() - Event - window.postMessage \"changeSize\" injected into matching page has been triggered" });

    if ($("#player-api embed").length > 0) {
        waitOnElement({"secs": 200, "type": "Flash"});
    } else {
        waitOnElement({ "secs": 200, "type": "HTML5" });
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
        $("#player, #playlist, #playlist-api").css("zoom", "reset"); // some one-time css (per video)

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

        for (method in $(element).get(0)) { 1; } // ensure all methods are loaded up

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
            changeSize({"type": vp["type"], "width": parseInt(videoWidth), "height": parseInt(videoHeight)});
        }
    }

    vp["last_width"] = videoWidth;
    setTimeout(watchViewport, 200, vp);
}

function sufficientWindow(wh) {
    debug({ "level": "function", "detail": "detailed", "msg": "changeSize.js mins()" });

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

function changeSize(options) {
    debug({"level": "function", "detail": "detailed", "msg": "changeSize.js changeSize()"});

    if (options["type"] == "Flash") {
        options["playlistBarHeight"] = ($('.watch7-playlist-bar').outerHeight()||0);
        options["controlsOffset"] = 17 * window.devicePixelRatio; //determined in flash
    }
    else if (options["type"] == "HTML5") {
        options["playlistBarHeight"] = ($("#playlist").outerHeight()||0);
        options["controlsOffset"] = $(".html5-video-controls").outerHeight();
    }

    changeViewport(options);
    if ($("#watch7-playlist-tray-container:visible").length > 0) {
        changePlaylist(options);
    }
    if ($('.watch7-playlist-bar:visible').length > 0) {
        changePlaylistbar(options);
    }
    changeLayout(options);
}

function changeViewport(options) {
    debug({ "level": "function", "msg": "changeSize.js changeViewport()" });

    if (options["type"] == "Flash") {
        $("#player-api, #player-api embed, #player").width(options["width"]);
        $("#player-api embed").height(options["height"]);
        $("#player-api").height(options["height"] + options["controlsOffset"]);
        $("#player").height(options["height"] + options["playlistBarHeight"] + options["controlsOffset"]);
    } 
    else if (options["type"] == "HTML5") {
        lowLevelCSS("#player-api video", { "attr": "width", "val": options["width"] + 'px' });
        lowLevelCSS("#player-api video", { "attr": "height", "val": options["height"] + 'px' });
        $("#player-api video").attr('height', options["height"] + 'px').attr('width', options["width"] + 'px');

        $("#player-api").css({ "width": options["width"], "height": options["height"] + options["controlsOffset"] });
        $(".html5-video-container, #player").css({ "width": options["width"], "height": options["height"] + options["controlsOffset"] + options["playlistBarHeight"] });

        lowLevelCSS("#movie_player", { "attr": "width", "val": options["width"] });
        lowLevelCSS("#movie_player", { "attr": "height", "val": options["height"] + options["controlsOffset"] + options["playlistBarHeight"] });
    }
}

function changePlaylistbar(options) {
    debug({ "level": "function", "msg": "changeSize.js changePlaylistbar()" });

    var leftOffset = $(".watch7-playlist-bar-left").outerWidth; // which is equal to options["width"];

    var interstitialBar = $("#watch7-playlist-interstitial:visible");
    var middleOffset = (interstitialBar.outerWidth() || 0);

    var playlistWidth = $("#watch7-playlist-tray-container").outerWidth();
    var rightOffset;
    if (playlistWidth > $(".watch7-playlist-bar-right").outerWidth()){
        rightOffset = playlistWidth;
    }
    else {
        rightOffset = $(".watch7-playlist-bar-right").outerWidth();
    }
    if (typeof rightOffset != "number") {
        rightOffset = 0;
    }

    $(".watch7-playlist-bar-left").css("width", leftOffset * window.devicePixelRatio);
    $(".watch7-playlist-bar-right").css("width", rightOffset);
    $(".watch7-playlist-bar, #playlist, #player").css("width", leftOffset + middleOffset + rightOffset);
}

function changePlaylist(options) {
    debug({ "level": "function", "msg": "changeSize.js changePlaylist()" });

    $("#watch7-playlist-tray-container").css({ "height": ($("#player").outerHeight() - ($("#playlist").outerHeight() / window.devicePixelRatio))/window.devicePixelRatio, "zoom": window.devicePixelRatio });
}

function changeLayout(options) {
    debug({ "level": "function", "msg": "changeSize.js changeLayout()" });
}

function lowLevelCSS(label, pair) {
    debug({ "level": "function", "detail": "detailed", "msg": "changeSize.js lowLevelCSS() - label: '" + label + "' attr: " + pair["attr"] + " val: " + pair["val"] });

    var v = $(label).get(0);
    var css = v.style.cssText;

    if (css.match(pair["attr"] + ': ' + pair["val"])) {
        return;
    }

    var cssStyle = pair["attr"] + ': ' + pair["val"] + ';';
    if (css.match(pair["attr"] + ':')) {
        v.style.cssText = css.replace(pair["attr"] + ': \S+?;', cssStyle);
    }
    else {
        v.style.cssText = cssStyle + ((css) ? " " + css : "");
    }

    if (css.match(pair["attr"] + ': ' + pair["val"])) {
        return;
    }

    if (pair["attr"] == "width") {
        v.style.width = pair["val"];
    }
    else if (pair["attr"] == "height") {
        v.style.height = pair["val"];
    }
    else if (pair["attr"] == "zoom") {
        v.style.zoom = pair["val"];
    }
}