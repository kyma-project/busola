var request = require('requestretry');

module.exports = function(urlToTest) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  return new Promise((resolve, reject) => {
    request({
      url: urlToTest,
      json: true,
      maxAttempts: 5,
      retryDelay: 5000,
      retrySrategy: request.RetryStrategies.HTTPOrNetworkError,
      // TODO: Analyze problem with UNABLE_TO_VERIFY_LEAF_SIGNATURE
      rejectUnauthorized: false
    })
      .then(function(response) {
        console.log(
          `Testing avilibility of ${urlToTest} : ${response.statusCode}`
        );
        if (response.statusCode == 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(function(error) {
        console.log(
          `Error while testing avilibility of ${urlToTest} : ${error}`
        );
        reject(error);
      });
  });
};
