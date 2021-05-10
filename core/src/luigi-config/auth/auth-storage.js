// we can't just use Luigi.auth().store, as there's no
// store if Luigi.config.auth is not set.

let authData;

export function clearAuthData() {
  authData = null;
}

export function setAuthData(data) {
  authData = data;
}

export function getAuthData() {
  return authData;
}
