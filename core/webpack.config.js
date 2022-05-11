const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = env => {
  return {
    mode: 'production',
    entry: {
      luigiConfig: './src/luigi-config/luigi-config.js',
      luigi: './src/assets/libs/luigi-core/luigi.js',
    },
    output: {
      filename: '[name].[contenthash].bundle.js',
      path: path.resolve(__dirname, 'src/assets'),
      chunkFilename: '[name].[contenthash].bundle.js',
      publicPath: '/assets/',
    },
    module: {
      rules: [
        {
          loader: 'babel-loader',
          exclude: /html|css|woff|woff2/,
          options: {
            rootMode: 'root',
          },
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: 'index.[contenthash].css' }),
      new CopyWebpackPlugin([
        {
          from:
            '../node_modules/@sap-theming/theming-base-content/content/Base/baseLib/sap_fiori_3_hcb/css_variables.css',
          to: 'libs/themes/hcb.css',
        },
        {
          from:
            '../node_modules/@sap-theming/theming-base-content/content/Base/baseLib/sap_fiori_3_hcw/css_variables.css',
          to: 'libs/themes/hcw.css',
        },
        {
          from:
            '../node_modules/@sap-theming/theming-base-content/content/Base/baseLib/sap_fiori_3_dark/css_variables.css',
          to: 'libs/themes/dark.css',
        },
        {
          from:
            '../node_modules/@sap-theming/theming-base-content/content/Base/baseLib/sap_fiori_3_light_dark/css_variables.css',
          to: 'libs/themes/light_dark.css',
        },
      ]),
      new webpack.DefinePlugin({
        'process.env.IS_DOCKER': env.IS_DOCKER,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './src/template.html'),
        filename: '../index.html', // output file
      }),
    ],
  };
};
