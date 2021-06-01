const env = Cypress.env();
const domain = env.DOMAIN || 'local.kyma.dev';

export default {
  domain: domain,
  localDev: env.LOCAL_DEV || false,
  get namespaceName() {
    return env.NAMESPACE_NAME || sessionStorage.getItem('namespaceName');
  },
  set namespaceName(val) {
    sessionStorage.setItem('namespaceName', val);
  },
  clusterAddress: env.LOCAL_DEV
    ? `http://localhost:4200/clusters`
    : `https://busola.${domain}/clusters`,
};
