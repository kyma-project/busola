function createAuthHeaders(auth) {
  if (auth?.idToken) {
    return { Authorization: `Bearer ${auth.idToken}` };
  } else if (
    auth &&
    auth['client-certificate-data'] &&
    auth['client-key-data']
  ) {
    return {
      'X-Client-Certificate-Data': auth['client-certificate-data'],
      'X-Client-Key-Data': auth['client-key-data'],
    };
  } else {
    throw Error('No available data to authenticate the request.');
  }
}

export function createHeaders(authData, cluster) {
  return {
    ...createAuthHeaders(authData),
    'X-Cluster-Url': cluster?.server,
    'X-Cluster-Certificate-Authority-Data':
      cluster && cluster['certificate-authority-data'],
  };
}
