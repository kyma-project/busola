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
