export function getResourceUrl() {
  const queryParams = new URLSearchParams(window.location.search);
  const fullResourceApiPath = queryParams.get('fullResourceApiPath');
  const resourceApiPath = queryParams.get('resourceApiPath');

  // resource names can't be lowercased - Role Bindings there could be name with upper case
  const tokens = window.location.pathname.split('/');
  let tokensLength = tokens.length;

  if (window.location.pathname.startsWith('/backend')) {
    if (tokensLength === 5) tokensLength = 4;
    else if (tokensLength === 7) tokensLength = 6;
    else if (tokensLength === 9) tokensLength = 8;
  } else {
    throw Error("We could't be here" + window.location.pathname);
    // if (tokensLength === 3) tokensLength = 2;
    // else if (tokensLength === 5) tokensLength = 4;
    // else if (tokensLength === 7) tokensLength = 6;
  }

  for (let i = 0; i < tokensLength; i++) {
    tokens[i] = tokens[i].toLocaleLowerCase();
  }

  const resourceUrlName = tokens.join('/');

  return fullResourceApiPath
    ? fullResourceApiPath
    : resourceApiPath + resourceUrlName.replace(/^\/core-ui/, '');
}
