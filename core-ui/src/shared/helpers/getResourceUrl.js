export function getResourceUrl() {
  const queryParams = new URLSearchParams(window.location.search);

  // replace for npx routing
  return (
    queryParams.get('resourceApiPath') +
    window.location.pathname.toLocaleLowerCase().replace(/^\/core-ui/, '')
  );
}
