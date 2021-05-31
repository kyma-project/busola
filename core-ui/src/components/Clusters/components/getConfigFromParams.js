import createEncoder from 'json-url';
import { DEFAULT_MODULES } from 'react-shared';

const encoder = createEncoder('lzma');

export const decompress = async initParams => {
  return await encoder.decompress(initParams);
};

export const getConfigFromParams = async initParams => {
  if (!initParams) return {};
  const decoded = await decompress(initParams);
  const clusterConfig = {
    ...decoded?.config,
    modules: { ...DEFAULT_MODULES, ...(decoded?.config?.modules || {}) },
  };
  return clusterConfig;
};
