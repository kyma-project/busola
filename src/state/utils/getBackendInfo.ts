import getEnv, { Envs } from '../../shared/utils/env';

const domain = window.location.hostname;

async function getBackendAddress() {
  const backendUrl = await getEnv(Envs.BACKEND_URL);
  console.log(backendUrl);
  if (backendUrl) {
    return backendUrl;
  }

  // local busola - needed for e2e tests to work locally
  if (
    window.location.hostname.startsWith('localhost') &&
    window.location.port === '8080' &&
    !process.env.IS_DOCKER
  ) {
    return 'http://127.0.0.1:3001/backend';
    // dev busola
  } else if (window.location.hostname.startsWith('localhost')) {
    return 'http://localhost:3001/backend';
    // on cluster
  } else {
    return '/backend';
  }
}

export async function getClusterConfig() {
  return {
    domain,
    backendAddress: await getBackendAddress(),
  };
}
