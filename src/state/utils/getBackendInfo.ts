const domain = window.location.hostname;

export const getClusterConfig = () => ({
  domain,
  backendAddress: '/backend',
});
