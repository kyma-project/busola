const domain = window.location.hostname;

const getBackendAddress = () => {
  // dev busola
  if (window.location.hostname.startsWith('localhost')) {
    return 'http://0.0.0.0:3001/backend';
    // on cluster
  } else {
    return '/backend';
  }
};
export const getClusterConfig = () => ({
  domain,
  backendAddress: getBackendAddress(),
});
