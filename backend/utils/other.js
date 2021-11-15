export function requestLogger(httpModule) {
  var original = httpModule.request;
  httpModule.request = function(options, callback) {
    console.log('Outgoing HTTP request with options', options);
    console.log('Outgoing HTTP request with options', options);
    return original(options, callback);
  };
}
