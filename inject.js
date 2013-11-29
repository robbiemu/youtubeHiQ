function injectScript(script) {
    var s = document.createElement('script');
    s.type = 'text/javascript';

    if (script.match(/^http\:\/\//)) {
        s = loadAsync(script, s);
    }
    else
        s = loadLocal(script, s);

    var place = document.getElementsByTagName('script')[0]; place.parentNode.insertBefore(s, place);
}

function loadAsync(script, s) { // manifest.json will need permission like:
    //  "content_security_policy": "script-src 'self' https://ssl.google-analytics.com; object-src 'self'"
    // where the url therein matches the script variable
    s.async = true;
    s.src = script;
    return (s);
}

function loadLocal(script, s) {
    s.src = chrome.extension.getURL(script);
    s.onload = function () {
        this.parentNode.removeChild(this);
    };
    return (s);
}

["changeQuality.js", "jquery-1.10.2.min.js"].forEach(injectScript);