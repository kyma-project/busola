const domain = location.hostname;
const isLocalDev =
  location.hostname.startsWith('localhost') && location.port !== '3001'; // todo
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
};
