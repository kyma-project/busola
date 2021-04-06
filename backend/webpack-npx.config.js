const webpack = require('webpack');
const path = require('path');
const defaultConfig = require('./webpack.config');
const { merge } = require('webpack-merge');

module.exports = merge(defaultConfig, {
  entry: path.resolve(__dirname, './npx.js'),
  output: { filename: 'index-npx.js' },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': "'npx'" }),
  ],
});
