module.exports = (on, config) => {
  const random = Math.floor(Math.random() * 9999) + 1000;
  const NAMESPACE_NAME = `a-busola-test-${random}`;

  config.env.NAMESPACE_NAME = NAMESPACE_NAME;

  return config;
};
