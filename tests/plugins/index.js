const fs = require('fs');

module.exports = (on, config) => {
  module.exports = (on, config) => {
    /** the rest of your plugins... **/
    require('cypress-log-to-output').install(on);
    // or, if there is already a before:browser:launch handler, use .browserLaunchHandler inside of it
    // @see https://github.com/flotwig/cypress-log-to-output/issues/5
  };
  let namespaceName = process.env.NAMESPACE_NAME || null;
  // generate random namespace name if it wasn't provided as env
  const random = Math.floor(Math.random() * 9999) + 1000;
  const randomName = `a-busola-test-${random}`;
  if (!namespaceName) {
    namespaceName = randomName;
  }

  config.env.NAMESPACE_NAME = namespaceName;
  config.env.STORAGE_CLASS_NAME = randomName;

  on('task', {
    removeFile(filePath) {
      fs.unlinkSync(filePath);
      return null;
    },
    listDownloads(downloadsDirectory) {
      return fs.readdirSync(downloadsDirectory);
    },
  });
  return config;
};
