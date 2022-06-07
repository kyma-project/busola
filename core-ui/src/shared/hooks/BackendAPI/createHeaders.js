function createAuthHeaders(auth) {
  if (auth.token) {
    return { 'X-K8s-Authorization': `Bearer ${auth.token}` };
  } else if (auth['client-certificate-data'] && auth['client-key-data']) {
    return {
      'X-Client-Certificate-Data': auth['client-certificate-data'],
      'X-Client-Key-Data': auth['client-key-data'],
    };
  } else {
    throw Error('No available data to authenticate the request.');
  }
}

function createSSOHeader(ssoData) {
  if (ssoData) {
    return { Authorization: 'Bearer ' + ssoData.idToken };
  } else {
    return null;
  }
}

export function createHeaders(authData, cluster, requiresCA, ssoData) {
  const { 'certificate-authority-data': ca, server } =
    cluster?.currentContext.cluster.cluster || {};
  return {
    ...createAuthHeaders(authData),
    ...createSSOHeader(ssoData),
    'X-Cluster-Url': server,
    'X-Cluster-Certificate-Authority-Data': requiresCA ? ca : undefined,
  };
}
