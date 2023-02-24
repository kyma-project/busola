import path from 'path';
import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';

// eslint-disable-next-line import/no-anonymous-default-export
export default (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.txt$/,
          use: {
            loader: 'replace-name',
            options,
          },
        },
        {
          test: /\.ya?ml$/,
          enforce: 'pre',
          type: 'json',
          use: 'yaml-loader',
        },
        {
          test: [/\.multi-file.ya?ml$/, /\.multi-file.json$/],
          use: 'multi-file',
        },
      ],
    },
    resolveLoader: {
      modules: ['node_modules', path.resolve(__dirname, '../loaders')],
    },
  });

  compiler.outputFileSystem = createFsFromVolume(new Volume());
  compiler.outputFileSystem.join = path.join.bind(path);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(stats.toJson().errors);

      resolve(stats);
    });
  });
};
