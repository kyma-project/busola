const domain = location.hostname;

function getbackendApiUrl() {
  if (location.origin === 'http://localhost:3001') {
    return 'http://localhost:3001/backend'; // npx
  } else if (location.hostname.startsWith('localhost')) {
    // dev busola
    return 'http://localhost:3001';
  } else {
    // on cluster
    return '/backend';
  }
}
export const getClusterConfig = () => ({
  domain,
  backendApiUrl: getbackendApiUrl(),
});
