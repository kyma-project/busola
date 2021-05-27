const env = Cypress.env();

const random = Math.floor(Math.random() * 9999) + 1000;
module.exports = {
  domain: env.DOMAIN || 'local.kyma.dev',
  localDev: env.LOCAL_DEV || false,
  namespace: env.NAMESPACE_NAME,
  clusterAddress: env.LOCAL_DEV
    ? `http://localhost:4200/clusters`
    : `https://busola.${env.DOMAIN}/clusters`,
};
