export function getApiURL() {
  const clusterConfig = window['clusterConfig'];
  const clusterGraphQLUrl = clusterConfig && clusterConfig['graphqlApiUrl'];
  let graphqlApiUrl = clusterGraphQLUrl || 'http://localhost:3000/graphql';

  return graphqlApiUrl;
}
