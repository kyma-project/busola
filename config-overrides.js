// this overrides configs of webpack and jest. See react-app-rewired documentation for details

const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: function override(config, env) {
    config.resolve.alias = {
      // register aliases also in jsconfig.json
      shared: path.resolve(__dirname, 'src/shared'),
      ...config.resolve.alias,
    };

    config.resolve.extensions = [...config.resolve.extensions, '.ts', '.tsx'];
    config.plugins = [
      ...config.plugins,
      new webpack.DefinePlugin({
        'process.env.IS_DOCKER': env.IS_DOCKER,
      }),
    ];

    return config;
  },
  jest: function(config) {
    config.moduleNameMapper = {
      '^shared/?(.*)': '<rootDir>/src/shared/$1',
      ...config.moduleNameMapper,
    };
    config.snapshotSerializers = [
      'enzyme-to-json/serializer',
      ...(config.snapshotSerializers || []),
    ];
    return config;
  },
};
