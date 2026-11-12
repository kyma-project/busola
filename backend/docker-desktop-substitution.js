const isDockerDesktopCluster = process.env.DOCKER_DESKTOP_CLUSTER === 'true';
const isDocker = process.env.IS_DOCKER === 'true';

const isSubstitutionEnabled = isDockerDesktopCluster && isDocker;

if (isDockerDesktopCluster && !isDocker) {
  console.warn('DOCKER_DESKTOP_CLUSTER is ignored when IS_DOCKER != true.');
}

export function handleDockerDesktopSubsitution(url) {
  if (isSubstitutionEnabled && url.hostname === '0.0.0.0') {
    url.hostname = 'host.docker.internal';
  }
  return url;
}
