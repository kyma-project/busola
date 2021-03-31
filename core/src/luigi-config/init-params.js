import createEncoder from 'json-url';
import { config } from './config';

const PARAMS_KEY = 'busola.init-params';
const encoder = createEncoder('lzstring');

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
  if (config.isNpx) return;

  const params = new URL(location).searchParams.get('init');
  if (params) {
    const decoded = await encoder.decompress(params);
    const responseParams = getResponseParams(decoded.auth.usePKCE);
    const systemNamespaces = createSystemNamespacesList(
      decoded.config.systemNamespaces
    );
    saveInitParams({
      ...decoded,
      auth: {
        ...decoded.auth,
        ...responseParams,
      },
      config: {
        ...decoded.config,
        systemNamespaces,
      },
    });
  }
}

export function saveInitParams(params) {
  if (config.isNpx) return;
  localStorage.setItem(PARAMS_KEY, JSON.stringify(params));
}

export function getInitParams() {
  if (config.isNpx) {
    return { config: { systemNamespaces: '' } };
  }
  return JSON.parse(localStorage.getItem(PARAMS_KEY) || 'null');
}

export function clearInitParams() {
  localStorage.removeItem(PARAMS_KEY);
}