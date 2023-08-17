window["ji"] = {
  remoteLog: function(str) {
    window.webkit.messageHandlers.nativeLogger.postMessage(str);
  },
  postMessage: function(str) {
  window.webkit.messageHandlers.nativeCallback.postMessage(str);
},
// Temporary handler for incoming responses.
// The real handler will be set-up when initializing a Native.
// TODO: randomize the name of the 
  got: function() {
    window.ji.remoteLog("got not initialized: " + arguments[0])
  },
};
window.js_of_ios.remoteLog("Init.js done.");