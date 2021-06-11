const domain = location.hostname.replace(/^busola?\./, '');
const isNpx = location.origin === 'http://localhost:3001';
const isLocalDev = location.hostname.startsWith('localhost');
const localDomain = 'http://localhost';

export let config;

console.log(location.origin);

if (isNpx) {
  config = {
    domain,
    isNpx,
    localDomain,
    serviceCatalogModuleUrl: location.origin + '/catalog', // todo da się to uprościć?
    coreUIModuleUrl: location.origin + '/core-ui',
    backendApiUrl: location.origin + '/backend',
  };
} else {
  config = {
    domain,
    isNpx,
    localDomain,
    serviceCatalogModuleUrl: isLocalDev
      ? localDomain + ':8000'
      : location.origin + '/catalog',
    coreUIModuleUrl: isLocalDev
      ? localDomain + ':8889'
      : location.origin + '/core-ui',
    backendApiUrl: isLocalDev
      ? 'http://localhost:3001'
      : location.origin + '/backend',
  };
}
