module.exports = function(config, env) {
  if (env === 'development') {
    config.output.filename = 'static/js/[name]bundle.js';
  }

  config.module.rules.push({
    test: /\.worker\.js$/,
    use: { loader: 'worker-loader' },
  });

  return config;
};
