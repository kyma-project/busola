import { fetchQueue } from 'fetch-queue';
import { merge } from 'lodash';
import { convertStaticFeatures } from './feature-discovery';

let params = null;

export async function getBusolaClusterParams() {
  if (!params) {
    try {
      const cacheBuster = '?cache-buster=' + Date.now();
      const defaultConfigResponse = await fetchQueue(
        '/assets/defaultConfig.json' + cacheBuster,
      );
      const configMapResponse = await fetchQueue(
        '/assets/config/config.json' + cacheBuster,
      );

      const defaultParams = await defaultConfigResponse.json();
      const mapParams = await configMapResponse.json();
      if (defaultParams.config?.features)
        defaultParams.config.features = convertStaticFeatures(
          defaultParams.config?.features,
        );
      if (mapParams.config?.features)
        mapParams.config.features = convertStaticFeatures(
          mapParams.config?.features,
        );

      params = merge(defaultParams, mapParams);
    } catch (e) {
      console.warn('Cannot load cluster params: ', e);
      params = {};
    }
  }
  return params;
}
