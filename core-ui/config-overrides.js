module.exports = function(config, env) {
  if (env === 'development') {
    config.output.filename = 'static/js/[name]bundle.js';
  }
  return config;
};
