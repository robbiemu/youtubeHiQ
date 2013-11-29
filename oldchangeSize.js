function waitOnHTML5(secs) {
    debug({ "level": "timeouts", "msg": "changeSize.js waitOnHTML5 timeout" });

    if (typeof $("#player-api video").get(0).videoWidth == undefined) {
        setTimeout(waitOnHTML5, secs);
    }
    else {
        $("#player-api video, #movie_player, #player-api, #player, .html5-video-container").css("zoom", "reset");
        $(".html5-video-controls").css("zoom", window.devicePixelRatio);
        watchViewport({ "type": "HTML5", "last_width": 0 });
    }
}

function watchViewport(vp) {
    debug({ "level": "timeouts", "msg": "changeSize.js watchViewport timeout" });

    if (vp["type"] == "HTML5") {
        try {
            var last_width = vp["last_width"];
            var video = $("#player-api video").get(0);

            if (last_width != video.videoWidth) {
                if (mins([null, $("#player-api video").get(0).videoWidth, $("#player-api video").get(0).videoHeight ])) {
                    changeHTML5();
                }
            }

            vp["last_width"] = video.videoWidth;
            setTimeout(watchViewport, 200, vp);
        }
        catch (e) {
        }
    }
}

function changeHTML5() {
    debug({ "level": "function", "msg": "changeSize.js changeHTML5()" });

    var video = $("#player-api video").get(0);

    for (method in video) { 1; } // ensure all methods are loaded up

    var controlsOffset = $(".html5-video-controls").outerHeight();//might need to factor zoom???
    var playlistOffset = $("#playlist").outerHeight();

    var vw = video.videoWidth + 'px';
    var vh = video.videoHeight + controlsOffset + 'px';

    // the video object only needs to provide layout space for the one following bar (playback controls)

    lowLevelCSS("#player-api video", { "attr": "width", "val": vw });
    lowLevelCSS("#player-api video", { "attr": "height", "val": vh });
    $("#player-api video").attr('height', vh).attr('width', vw);

    // the containers need to provide space for both the playback controls and the playlist
    vh = video.videoHeight + controlsOffset + 'px';

    $(".html5-video-container, #player-api, #player").css({ "width": vw, "height": vh });

    lowLevelCSS("#movie_player", { "attr": "width", "val": vw });
    lowLevelCSS("#movie_player", { "attr": "height", "val": vh });

    resetLayout(video.videoHeight);
}

function lowLevelCSS(label, pair) {
    debug({"level":"function", "detail":"detailed", "msg":"changeSize.js lowLevelCSS() - label: '" + label + "' attr: " + pair["attr"] + " val: " + pair["val"]});

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
        v.style.cssText = cssStyle + ((css)? " " + css: "");
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

function changeFlash() {
    debug({ "level": "function", "msg": "changeSize.js changeFlash()" });

    var wh = $("#player-api embed").attr("flashvars").match(/adaptive_fmts=.*?size\%3D(.\d+)x(.\d+)/);

    debug({ "detail": "detailed", "msg": "changeSize.js changeFlash() - setting width to " + wh[1] + " and height to " + wh[2] });

    if (mins(wh)) {
        var playbarHeight = $('.watch7-playlist-bar').outerHeight();
        var controlsOffset = playbarHeight; //determined in flash

        $("#player-api, #player-api embed, #player").width(wh[1]).height(wh[2]);
        $("#player-api").height(parseInt(wh[2]) + playbarHeight);
        $("#player").height(parseInt(wh[2]) + playbarHeight + controlsOffset);
        $("#player-api").css("zoom", "reset");

        resetLayout(wh[2]);
    }
    else
        return false;
}

function mins(wh) {
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

function resetLayout(height) {
    debug({ "level": "function", "detail": "detailed", "msg": "changeSize.js resetLayout()" });

//    lowLevelCSS("#watch7-playlist-tray-container", { "attr": "zoom", "val": ($("#player-api").get(0).getBoundingClientRect()["height"] / $("#watch7-playlist-tray-container").get(0).getBoundingClientRect()["height"]) / window.devicePixelRatio });
    lowLevelCSS("#watch7-playlist-tray-container", { "attr": "zoom", "val": $("#player-api").outerHeight() / $("#watch7-playlist-tray-container").outerHeight()});

    var tmp_height = $("#player-api").height() * window.devicePixelRatio;
    var tmp_index = $("#player").offset()["top"];

    if ($("#playlist").height() > 0) {
        tmp_index = tmp_index + $("#playlist").offset()["top"];
    }
    tmp_index = tmp_index + (height / window.devicePixelRatio);
}