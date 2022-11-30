export function getResourceUrl() {
  const queryParams = new URLSearchParams(window.location.search);
  const fullResourceApiPath = queryParams.get('fullResourceApiPath');
  // const resourceApiPath = queryParams.get('resourceApiPath');
  const resourceApiPath = '/api/v1';

  return fullResourceApiPath
    ? fullResourceApiPath
    : resourceApiPath + window.location.pathname.replace(/^\/core-ui/, '');
}
