export function buildK8sRequestPath(targetApiServer, originalUrl) {
  const basePath =
    targetApiServer.pathname !== '/'
      ? targetApiServer.pathname.replace(/\/$/, '')
      : '';
  return basePath + originalUrl.replace(/^\/backend/, '');
}
