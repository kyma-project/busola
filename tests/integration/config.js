const env = Cypress.env();
const domain = env.DOMAIN || 'https://local.kyma.dev';

export default {
  domain: domain,
  localDev: env.LOCAL_DEV || false,
  clusterAddress: env.LOCAL_DEV ? `http://localhost:8080` : `${domain}`,
};
