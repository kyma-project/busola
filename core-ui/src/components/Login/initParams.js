const PARAMS_KEY = 'busola.init-params';

export function areInitParamsPresent() {
  return !!localStorage.getItem(PARAMS_KEY);
}

export function saveInitParams(cluster, token) {
  const params = {
    cluster,
    auth: {
      ...decoded.auth,
      ...responseParams,
    },
    config: {
      ...decoded.config,
      systemNamespaces,
    },
  };
}
