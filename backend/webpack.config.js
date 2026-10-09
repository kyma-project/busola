import path from 'path';
import nodeExternals from 'webpack-node-externals';

export default {
  externals: [nodeExternals()],
  target: 'node',
  entry: path.resolve(import.meta.dirname, './index.js'),
  module: {
    rules: [
      {
        test: /\.js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  output: {
    path: path.resolve(import.meta.dirname, '.'),
    filename: 'backend-production.cjs',
  },
  optimization: {
    nodeEnv: false,
  },
};
