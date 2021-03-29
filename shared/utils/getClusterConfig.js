const domain = location.hostname.replace(/^busola?\./, '');

function getbackendApiUrl() {
  if (location.origin === 'http://localhost:3001') {
    return 'http://localhost:3001/backend'; // npx
  } else if (location.hostname.startsWith('localhost')) {
    // dev busola
    return 'http://localhost:3001';
  } else {
    // on cluster
    return 'https://' + domain + '/backend';
  }
}
export const getClusterConfig = () => ({
  domain,
  backendApiUrl: getbackendApiUrl(),
});
