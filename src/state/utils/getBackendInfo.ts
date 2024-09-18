const domain = window.location.hostname;

const getBackendAddress = () => {
  // local busola - needed for e2e tests to work locally
  if (
    window.location.hostname.startsWith('localhost') &&
    window.location.port === '8080'
  ) {
    return 'http://127.0.0.1:3001/backend';
    // dev busola
  } else if (window.location.hostname.startsWith('localhost')) {
    return 'http://localhost:3001/backend';
    // on cluster
  } else {
    return '/backend';
  }
};
export const getClusterConfig = () => ({
  domain,
  backendAddress: getBackendAddress(),
});
