const fs = require('fs');

module.exports = (on, config) => {
  let namespaceName = process.env.NAMESPACE_NAME || null;
  // generate random namespace name if it wasn't provided as env
  const random = Math.floor(Math.random() * 9999) + 1000;
  const randomName = `a-busola-test-${random}`;
  if (!namespaceName) {
    namespaceName = randomName;
  }
  const dynamicSharedStore = {
    cancelTests: false,
  };

  const date = new Date();
  const todaysDate =
    date.getMonth() +
    1 +
    '/' +
    date.getDate() +
    '-' +
    (date.getUTCHours() + 1) +
    ':' +
    date.getUTCMinutes();
  const reportName = `AMP_REPORT_${todaysDate}`;

  config.env.NAMESPACE_NAME = namespaceName;
  config.env.STORAGE_CLASS_NAME = randomName;
  config.env.APP_NAME = randomName;
  config.env.ACC_AMP_TOKEN = process.env.ACC_AMP_TOKEN;
  config.env.IS_PR = process.env.IS_PR;
  config.env.AMP_REPORT_NAME = reportName;

  on('task', {
    removeFile(filePath) {
      fs.unlinkSync(filePath);
      return null;
    },
    listDownloads(downloadsDirectory) {
      return fs.readdirSync(downloadsDirectory);
    },
    // invoke setter cy.task('dynamicSharedStore', { name: 'cancelTests', value: true })
    // invoke getter cy.task('dynamicSharedStore', { name: 'cancelTests' })
    dynamicSharedStore(property) {
      if (property.value !== undefined) {
        return (dynamicSharedStore[property.name] = property.value);
      } else {
        return dynamicSharedStore[property.name];
      }
    },
  });

  on('before:browser:launch', (browser = {}, launchOptions) => {
    console.log(
      'Resizing browser in headless mode for better screenshot and video quality in CI',
    );
    const width = 1920;
    const height = 1080;

    if (
      browser.name === 'chrome' ||
      (browser.name === 'chromium' && browser.isHeadless)
    ) {
      launchOptions.args.push(`--window-size=${width},${height}`);
    }
  });
  return config;
};
