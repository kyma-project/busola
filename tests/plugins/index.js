const fs = require('fs');

module.exports = (on, config) => {
  on('task', {
    removeFile(filePath) {
      fs.unlinkSync(filePath);
      return null;
    },
  });
  const random = Math.floor(Math.random() * 9999) + 1000;
  const NAMESPACE_NAME = `a-busola-test-${random}`;
  config.env.NAMESPACE_NAME = NAMESPACE_NAME;
  return config;
};
