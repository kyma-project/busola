export function getResourceUrl() {
  const queryParams = new URLSearchParams(window.location.search);
  const fullResourceApiPath = queryParams.get('fullResourceApiPath');
  const resourceApiPath = queryParams.get('resourceApiPath');

  // Validation for Role Bindings - there could be name with upper case
  const tokens = window.location.pathname.split('/');
  let tokensLength = tokens.length;

  if (tokensLength === 3) tokensLength = 2;
  else if (tokensLength === 5) tokensLength = 4;

  for (let i = 0; i < tokensLength; i++) {
    tokens[i] = tokens[i].toLocaleLowerCase();
  }

  const resourceUrlName = tokens.join('/');

  return fullResourceApiPath
    ? fullResourceApiPath
    : resourceApiPath + resourceUrlName.replace(/^\/core-ui/, '');
}
