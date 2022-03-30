const domain = window.location.hostname;

function getBackendAddress() {
  // dev busola
  if (window.location.hostname.startsWith('localhost')) {
    return 'http://localhost:3001/backend';
    // on cluster
  } else {
    return '/backend';
  }
}
export const getClusterConfig = () => ({
  domain,
  backendAddress: getBackendAddress(),
});
