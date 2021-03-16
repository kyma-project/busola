const domain = location.hostname.replace(/^busola(-dev)?\./, '');

export const getClusterConfig = () =>
  ({
    domain,
    graphqlApiUrl: `https://busola-backend.${domain}/graphql`,
    subscriptionsApiUrl: `wss://busola-backend.${domain}/graphql`,
  } as any);
