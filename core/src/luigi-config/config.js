const domain = location.hostname;
const isLocalDev =
  location.hostname.startsWith('localhost') && !process.env.IS_DOCKER;
const localDomain = 'http://localhost';

export const config = {
  domain,
  coreUIModuleUrl: isLocalDev
    ? localDomain + ':8889'
    : location.origin + '/core-ui',
  backendAddress: isLocalDev
    ? 'http://localhost:3001/backend'
    : location.origin + '/backend',
};
