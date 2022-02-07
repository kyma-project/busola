const CopyPlugin = require('copy-webpack-plugin');
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
      chunkFilename: '[name].bundle.js',
      publicPath: '/assets/',
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
      new CopyPlugin({
        patterns: [
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
        ],
      }),
      new webpack.DefinePlugin({
        'process.env.IS_DOCKER': env.IS_DOCKER,
      }),
    ],
  };
};
