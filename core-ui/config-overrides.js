module.exports = function(config, env) {
  if (env === 'development') {
    config.output.filename = 'static/js/[name]bundle.js';
  }

  const rules = config.module.rules;

  // console.log(rules.length);
  // console.log(JSON.stringify(rules));
  //
  rules.splice(rules.length - 1, 0, {
    test: /\.worker\.js$/,
    loader: 'worker-loader',
    options: {
      publicPath: '/static/workers',
      // inline: 'fallback',
      // esModule: true,
    },
  });

  // rules[2].oneOf.splice(rules.length - 1, 0, {
  //   test: /\.worker\.js$/,
  //   loader: 'worker-loader',
  //   options: {
  //     // publicPath: '/static/workers',
  //     // inline: 'fallback',
  //     // esModule: true,
  //   },
  // });

  return config;
};
