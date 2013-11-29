var debugKeys = {
    "level": ["off", "event", "function", "timeouts"],
    "detail": ["minimal", "detailed"]
};
var debugState = { "level": "function", "detail": "minimal" };

function debug(options) {
	if ("level" in options) {
		if (verifyDebugValue("level", options["level"]) == false)
			return
	}
	if ("detail" in options) {
		if (verifyDebugValue("detail", options["detail"]) == false)
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
        if (debugKeys[lval][k] == debugState[lval]) { // rval was greater than debug key
            return false;
        }
    }
}