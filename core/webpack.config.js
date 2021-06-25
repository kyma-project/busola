const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = env => {
  return {
    mode: 'production',
    entry: {
      luigiConfig: './src/luigi-config/luigi-config.js',
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'src/assets'),
    },
    module: {
      rules: [
        {
          loader: 'babel-loader',
          options: {
            rootMode: 'root',
          },
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: './node_modules/@luigi-project/core', to: 'libs/luigi-core' },
        { from: '../node_modules/monaco-editor/min/vs', to: 'libs/vs' },
      ]),
      new webpack.DefinePlugin({
        'process.env.IS_DOCKER': env.IS_DOCKER,
      }),
    ],
  };
};
