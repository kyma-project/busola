const env = Cypress.env();

module.exports = {
  domain: env.DOMAIN || 'local.kyma.dev',
  localDev: env.LOCAL_DEV || false,
};
