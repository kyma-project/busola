const domain = location.hostname.replace(/^busola(-dev)?\./, '');
const isLocalDev = location.hostname.startsWith('busola-dev');

function getbackendApiUrl() {
  if (location.origin === 'http://localhost:3001') {
    return 'http://localhost:3001/backend'; // npx
  } else if (
    location.hostname.startsWith('busola-dev') ||
    location.hostname.startsWith('localhost')
  ) {
    // dev busola
    return 'http://localhost:3001';
  } else {
    // on cluster
    return 'https://' + domain + '/backend';
  }
}
export const getClusterConfig = () => ({
  domain,
  graphqlApiUrl: `https://busola-backend.${domain}/graphql`,
  subscriptionsApiUrl: `wss://busola-backend.${domain}/graphql`,
  backendApiUrl: getbackendApiUrl(),
});
