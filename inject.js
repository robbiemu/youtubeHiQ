var s = document.createElement('script');
s.src = chrome.extension.getURL("changeQuality.js");
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);