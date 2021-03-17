const domain = location.hostname.replace(/^busola(-dev)?\./, '');
const isNpx = location.origin === 'http://localhost:3001';
const isLocalDev =
  location.hostname.startsWith('busola-dev') ||
  location.hostname.startsWith('localhost');
const localDomain = location.hostname.startsWith('busola-dev')
  ? 'http://busola-dev.' + domain
  : 'http://localhost';

export let config;

if (isNpx) {
  config = {
    domain,
    isNpx,
    localDomain: 'busola-dev.' + domain,
    serviceCatalogModuleUrl: location.origin + '/catalog',
    addOnsModuleUrl: location.origin + '/addons',
    logsModuleUrl: location.origin + '/logs',
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
      : 'https://catalog.' + domain,
    addOnsModuleUrl: isLocalDev
      ? localDomain + ':8004'
      : 'https://addons.' + domain,
    logsModuleUrl: isLocalDev
      ? localDomain + ':8005'
      : 'https://logs.' + domain,
    coreUIModuleUrl: isLocalDev
      ? localDomain + ':8889'
      : 'https://core-ui.' + domain,
    backendApiUrl: isLocalDev
      ? 'http://localhost:3001'
      : 'https://busola.' + domain + '/backend',
  };
}
