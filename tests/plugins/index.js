const fs = require('fs');

module.exports = (on, config) => {
  let namespaceName = process.env.NAMESPACE_NAME || null;
  on('task', {
    removeFile(filePath) {
      fs.unlinkSync(filePath);
      return null;
    },
    setNamespace(name) {
      namespaceName = name;
      return null;
    },
    getNamespace() {
      return namespaceName;
    },
  });
  return config;
};
