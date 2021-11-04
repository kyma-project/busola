const path = require('path');
require('@babel/register');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  externals: [nodeExternals()],
  target: 'node',
  entry: path.resolve(__dirname, './index.js'),
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'backend-production.js',
  },
  optimization: {
    nodeEnv: false, //don't substitute process.env.NODE_ENV
  },
};
