export function createHeaders(idToken, cluster) {
  return {
    Authorization: 'Bearer ' + idToken,
    'X-Cluster-Url': cluster.server,
    'X-Cluster-Certificate-Authority-Data':
      cluster['certificate-authority-data'],
  };
}
