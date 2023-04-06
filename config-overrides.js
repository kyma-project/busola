// this overrides configs of webpack and jest. See react-app-rewired documentation for details

const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

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
      new CopyPlugin({
        patterns: [
          {
            from: 'resources/resource-validation/rule-sets/**/*.yaml',
            to: 'resource-validation/rule-set.yaml',
            transformAll(assets) {
              return assets.reduce((accumulator, asset) => {
                return `${accumulator}---\n${asset.data}\n`;
              }, '');
            },
          },
        ],
      }),
    ];

    // config.resolveLoader = {
    //   modules: ['node_modules', path.resolve(__dirname, './loaders')],
    // };
    // config.module.rules.push({
    //   test: /\.ya?ml$/,
    //   enforce: 'pre',
    //   type: 'json',
    //   use: 'yaml-loader',
    // });

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
