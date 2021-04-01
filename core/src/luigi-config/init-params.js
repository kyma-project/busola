import createEncoder from 'json-url';

const PARAMS_KEY = 'busola.init-params';
const encoder = createEncoder('lzma');

function getResponseParams(usePKCE = true) {
  if (usePKCE) {
    return {
      responseType: 'code',
      responseMode: 'query',
    };
  } else {
    return { responseType: 'id_token' };
  }
}

function createSystemNamespacesList(namespaces) {
  return namespaces ? namespaces.split(' ') : [];
}

export async function saveInitParamsIfPresent(location) {
  const initParams = new URL(location).searchParams.get('init');
  if (initParams) {
    const decoded = await encoder.decompress(initParams);
    const systemNamespaces = createSystemNamespacesList(
      decoded.config?.systemNamespaces
    );
    const params = {
      ...decoded,
      config: {
        ...decoded.config,
        systemNamespaces,
      },
    };
    if (decoded.auth) {
      params.auth = {
        ...decoded.auth,
        ...getResponseParams(decoded.auth.usePKCE),
      };
    }
    saveInitParams(params);
  }
}

export function saveInitParams(params) {
  localStorage.setItem(PARAMS_KEY, JSON.stringify(params));
}

export function getInitParams() {
  return JSON.parse(localStorage.getItem(PARAMS_KEY) || 'null');
}

export function clearInitParams() {
  localStorage.removeItem(PARAMS_KEY);
}
