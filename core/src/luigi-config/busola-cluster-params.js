import { merge } from 'lodash';
import { convertStaticFeatures } from './feature-discovery';
import jsyaml from 'js-yaml';

let params = null;

export async function getBusolaClusterParams() {
  if (!params) {
    try {
      const cacheBuster = '?cache-buster=' + Date.now();
      const defaultConfigResponse = await fetch(
        '/assets/defaultConfig.yaml' + cacheBuster,
      );
      const configMapResponse = await fetch(
        '/assets/config/config.yaml' + cacheBuster,
      );

      const defaultParams = jsyaml.load(await defaultConfigResponse.text());
      const mapParams = jsyaml.load(await configMapResponse.text());

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
