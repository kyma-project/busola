const domain = window.location.hostname;

const getBackendAddress = () => {
  // dev busola
  if (window.location.hostname.startsWith('localhost')) {
    return 'http://localhost:3001/backend';
    // on cluster
  } else {
    return '/backend';
  }
};

const getCustomUiBackendAddress = () => {
  // dev busola
  if (window.location.hostname.startsWith('localhost')) {
    return 'http://localhost:3001/maytheforce/';
    // on cluster
  } else {
    return '/maytheforce/';
  }
};

export const getClusterConfig = () => ({
  domain,
  backendAddress: getBackendAddress(),
  customUIBackendAddress: getCustomUiBackendAddress(),
});
