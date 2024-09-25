// this overrides configs of webpack and jest. See react-app-rewired documentation for details

module.exports = {
  jest: function(config) {
    config.moduleNameMapper = {
      '^shared/?(.*)': '<rootDir>/src/shared/$1',
      ...config.moduleNameMapper,
    };
    config.transformIgnorePatterns = [
      'node_modules/(?!(@ui5|lit-html|d3|internmap)).*\\.js$',
    ];
    config.snapshotSerializers = [
      'enzyme-to-json/serializer',
      ...(config.snapshotSerializers || []),
    ];
    return config;
  },
};
