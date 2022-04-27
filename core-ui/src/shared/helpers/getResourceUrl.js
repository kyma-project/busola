export function getResourceUrl() {
  const queryParams = new URLSearchParams(window.location.search);
  const fullResourceApiPath = queryParams.get('fullResourceApiPath');
  const resourceApiPath = queryParams.get('resourceApiPath');

  return fullResourceApiPath
    ? fullResourceApiPath
    : resourceApiPath + window.location.pathname.replace(/^\/core-ui/, '');
}

export function getResourceApiPath() {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get('resourceApiPath');
}
