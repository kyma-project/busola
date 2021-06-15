const env = Cypress.env();
const domain = env.DOMAIN || 'local.kyma.dev';

export default {
  domain: domain,
  localDev: env.LOCAL_DEV || false,
  clusterAddress: env.LOCAL_DEV
    ? `http://localhost:4200/clusters`
    : `https://${domain}/clusters`,
};
