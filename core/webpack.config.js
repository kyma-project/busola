const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
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
      { from: './node_modules/@luigi-project/core', to: 'luigi-core' },
    ]),
  ],
};
