const domain = location.hostname.replace(/^busola?\./, ''); // todo może niepotrzebne już?
const isNpx = location.origin === 'http://localhost:3001';
const isLocalDev = location.hostname.startsWith('localhost');
const localDomain = 'http://localhost';

export let config;

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
      : 'https://busola.' + domain + '/catalog',
    coreUIModuleUrl: isLocalDev
      ? localDomain + ':8889'
      : 'https://busola.' + domain + '/core-ui',
    backendApiUrl: isLocalDev
      ? 'http://localhost:3001'
      : 'https://busola.' + domain + '/backend',
  };
}
