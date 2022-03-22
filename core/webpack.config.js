// working luigiconfig
//

const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
          exclude: /html/,
          options: {
            rootMode: 'root',
          },
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: './node_modules/@luigi-project/core', to: 'libs/luigi-core' },
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
        { from: '../node_modules/monaco-editor/min/vs', to: 'libs/vs' },
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

//in progress

// const CopyWebpackPlugin = require('copy-webpack-plugin');
// const webpack = require('webpack');
// const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

// module.exports = env => {
//   return {
//     mode: 'production',
//     entry: {
//       luigiConfig: {
//         import: './src/luigi-config/luigi-config.js',
//         filename: '[name].[contenthash].bundle.js',
//         publicPath: '../src/assets/',
//       },
//       luigijs: {
//         import: './src/assets/libs/luigi-core/luigi.js',
//         filename: '[name].[contenthash].js',
//         publicPath: '../src/assets/',
//       },
//     },
//     module: {
//       rules: [
//         {
//           loader: 'babel-loader',
//           exclude: /html/,
//           options: {
//             rootMode: 'root',
//           },
//         },
//       ],
//     },
//     plugins: [
//       new CopyWebpackPlugin([
//         { from: './node_modules/@luigi-project/core', to: 'libs/luigi-core' },
//         {
//           from:
//             '../node_modules/@sap-theming/theming-base-content/content/Base/baseLib/sap_fiori_3_hcb/css_variables.css',
//           to: 'libs/themes/hcb.css',
//         },
//         {
//           from:
//             '../node_modules/@sap-theming/theming-base-content/content/Base/baseLib/sap_fiori_3_hcw/css_variables.css',
//           to: 'libs/themes/hcw.css',
//         },
//         {
//           from:
//             '../node_modules/@sap-theming/theming-base-content/content/Base/baseLib/sap_fiori_3_dark/css_variables.css',
//           to: 'libs/themes/dark.css',
//         },
//         {
//           from:
//             '../node_modules/@sap-theming/theming-base-content/content/Base/baseLib/sap_fiori_3_light_dark/css_variables.css',
//           to: 'libs/themes/light_dark.css',
//         },
//         { from: '../node_modules/monaco-editor/min/vs', to: 'libs/vs' },
//       ]),
//       new webpack.DefinePlugin({
//         'process.env.IS_DOCKER': env.IS_DOCKER,
//       }),
//       new HtmlWebpackPlugin({
//         template: path.resolve(__dirname, './src/template.html'),
//         filename: 'index.html', // output file
//       }),
//     ],
//   };
// };
