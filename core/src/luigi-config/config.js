const domain = location.hostname.replace(/^busola(-dev)?\./, '');
const isNpx = location.origin === 'http://localhost:3001';
const isLocalDev = location.hostname.startsWith('busola-dev');

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
    pamelaApiUrl: location.origin + '/backend',
  };
} else {
  config = {
    domain,
    isNpx,
    localDomain: 'busola-dev.' + domain,
    serviceCatalogModuleUrl: isLocalDev
      ? 'http://busola-dev.' + domain + ':8000'
      : 'https://catalog.' + domain,
    addOnsModuleUrl: isLocalDev
      ? 'http://busola-dev.' + domain + ':8004'
      : 'https://addons.' + domain,
    logsModuleUrl: isLocalDev
      ? 'http://busola-dev.' + domain + ':8005'
      : 'https://logs.' + domain,
    coreUIModuleUrl: isLocalDev
      ? 'http://busola-dev.' + domain + ':8889'
      : 'https://core-ui.' + domain,
    pamelaApiUrl: isLocalDev
      ? 'http://localhost:3001'
      : 'https://busola.' + domain + '/backend',
  };
}
