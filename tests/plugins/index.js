const fs = require('fs');

module.exports = (on, config) => {
  let namespaceName = process.env.NAMESPACE_NAME || null;
  // generate random namespace name if it wasn't provided as env
  if (!namespaceName) {
    const random = Math.floor(Math.random() * 9999) + 1000;
    namespaceName = `a-busola-test-${random}`;
  }
  config.env.NAMESPACE_NAME = namespaceName;

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
