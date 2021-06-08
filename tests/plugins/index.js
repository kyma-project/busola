const fs = require('fs');

module.exports = (on, config) => {
  on('task', {
    removeFile(filePath) {
      fs.unlinkSync(filePath);
      return null;
    },
  });
  return config;
};
