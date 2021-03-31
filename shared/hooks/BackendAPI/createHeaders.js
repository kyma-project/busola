export function createHeaders(token, cluster) {
  return 'xd';
  return {
    Authorization: 'Bearer ' + token,
    'X-Cluster-Url': cluster.server,
    'X-Cluster-Certificate-Authority-Data':
      cluster['certificate-authority-data'],
  };
}
