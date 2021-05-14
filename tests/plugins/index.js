module.exports = (on, config) => {
  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.family === 'firefox') {
      // launchOptions.preferences is a map of preference names to values
      launchOptions.preferences[
        'security.fileuri.strict_origin_policy'
      ] = false;

      return launchOptions;
    }
  });
};
