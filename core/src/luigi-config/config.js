const domain = location.hostname;
const isLocalDev =
  location.hostname.startsWith('localhost') && !process.env.IS_DOCKER;
const localDomain = 'http://localhost';

export const config = {
  domain,
  serviceCatalogModuleUrl: isLocalDev
    ? localDomain + ':8000'
    : location.origin + '/service-catalog',
  coreUIModuleUrl: isLocalDev
    ? localDomain + ':8889'
    : location.origin + '/core-ui',
  backendAddress: isLocalDev
    ? 'http://localhost:3001/backend'
    : location.origin + '/backend',
  pluginsUrl: isLocalDev ? 'http://127.0.0.1:8099' : 'http://127.0.0.1:8099',
};
