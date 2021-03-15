const domain = location.hostname.replace(/^busola(-dev)?\./, '');
const isLocalDev = location.hostname.startsWith('busola-dev');

export const getClusterConfig = () => ({
  domain,
  graphqlApiUrl: `https://busola-backend.${domain}/graphql`,
  subscriptionsApiUrl: `wss://busola-backend.${domain}/graphql`,
  backendApiUrl: isLocalDev
    ? 'http://localhost:3001'
    : `${location.protocol}//${location.host}/backend`,
});
