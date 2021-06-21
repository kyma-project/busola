export function getResourceUrl() {
  const queryParams = new URLSearchParams(window.location.search);

  return (
    queryParams.get('resourceApiPath') +
    window.location.pathname.toLocaleLowerCase().replace(/^\/core-ui/, '')
  );
}
