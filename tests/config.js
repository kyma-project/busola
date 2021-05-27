const env = Cypress.env();

const domain = env.DOMAIN || 'local.kyma.dev';
module.exports = {
  domain: domain,
  localDev: env.LOCAL_DEV || false,
  namespaceName: env.NAMESPACE_NAME,
  clusterAddress: env.LOCAL_DEV
    ? `http://localhost:4200/clusters`
    : `https://busola.${domain}/clusters`,
};
