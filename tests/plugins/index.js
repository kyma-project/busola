module.exports = (on, config) => {
  const random = Math.floor(Math.random() * 9999) + 1000;
  const NAMESPACE_NAME = `a-busola-test-${random}`;
  console.log('env2', config.env);
  config.env.NAMESPACE_NAME = NAMESPACE_NAME;

  config.env.CLUSTERS_ADDRESS = config.env.LOCAL_DEV
    ? `http://localhost:4200/clusters`
    : `https://busola.${config.domain}/clusters`;

  config.env.NAMESPACE_LIST_ADDRESS = config.env.LOCAL_DEV
    ? `http://localhost:4200/clusters`
    : `https://busola.${config.domain}/clusters`;

  return config;
};
