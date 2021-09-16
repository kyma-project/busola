const isDockerDesktopCluster = process.env.DOCKER_DESKTOP_CLUSTER === 'true';
const isDocker = process.env.IS_DOCKER === 'true';

const isSubstitutionEnabled = isDockerDesktopCluster && isDocker;

if (isDockerDesktopCluster && !isDocker) {
  console.warn('DOCKER_DESKTOP_CLUSTER is ignored when IS_DOCKER != true.');
}

export function handleDockerDesktopSubsitution(url) {
  if (isSubstitutionEnabled && url.hostname === '0.0.0.0') {
    url.hostname = 'host.docker.internal';
    // url.host = `${url.hostname}:${url.port}`;
    // url.href = `${url.protocol}//${url.host}${url.path}`;
  }
  return url;
}
