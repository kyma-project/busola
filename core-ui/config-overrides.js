// this overrides configs of webpack and jest. See react-app-rewired documentation for details

const path = require('path');

module.exports = {
  webpack: function override(config, env) {
    config.resolve.alias = {
      // register aliases also in jsconfig.json
      helpers: path.resolve(__dirname, 'src/service-catalog-ui/helpers'),
      shared: path.resolve(__dirname, 'src/shared'),
      ...config.resolve.alias,
    };

    return config;
  },
  jest: function(config) {
    config.moduleNameMapper = {
      '^helpers/?(.*)': '<rootDir>/src/service-catalog-ui/helpers/$1',
      '^shared/?(.*)': '<rootDir>/src/shared/$1',
      ...config.moduleNameMapper,
    };
    config.snapshotSerializers = [
      'enzyme-to-json/serializer',
      ...(config.snapshotSerializers || []),
    ];
    config.testPathIgnorePatterns = [
      '/node_modules/',
      '<rootDir>/src/service-catalog-ui/',
      ...(config.coveragePathIgnorePatterns || []),
    ];
    return config;
  },
};
