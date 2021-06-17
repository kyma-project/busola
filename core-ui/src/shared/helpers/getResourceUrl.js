export function getResourceUrl() {
  const queryParams = new URLSearchParams(window.location.search);
  const fullResourceApiPath = queryParams.get('fullResourceApiPath');
  const resourceApiPath = queryParams.get('resourceApiPath');

  // replace for npx routing
  return fullResourceApiPath
    ? fullResourceApiPath
    : resourceApiPath +
        window.location.pathname.toLocaleLowerCase().replace(/^\/core-ui/, '');
}
