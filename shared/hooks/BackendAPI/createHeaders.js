function createAuthHeaders(auth) {
  if (auth.token) {
    return { Authorization: `Bearer ${auth.token}` };
  } else if (auth['client-certificate-data'] && auth['client-key-data']) {
    return {
      'X-Client-Certificate-Data': auth['client-certificate-data'],
      'X-Client-Key-Data': auth['client-key-data'],
    };
  } else {
    throw Error('No available data to authenticate the request.');
  }
}

export function createHeaders(authData, cluster, requiresCA) {
  return {
    ...createAuthHeaders(authData),
    'X-Cluster-Url': cluster?.server,
    'X-Cluster-Certificate-Authority-Data': requiresCA
      ? cluster['certificate-authority-data']
      : undefined,
  };
}
