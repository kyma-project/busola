import { merge } from 'lodash';

let params = null;

export async function getBusolaClusterParams() {
  if (!params) {
    try {
      const cacheBuster = '?cache-buster=' + Date.now();
      const defaultConfigResponse = await fetch(
        '/assets/defaultConfig.json' + cacheBuster,
      );
      const configMapResponse = await fetch(
        '/assets/config/config.json' + cacheBuster,
      );

      const defultParams = await defaultConfigResponse.json();
      const mapParams = await configMapResponse.json();

      params = merge(defultParams, mapParams);
    } catch (e) {
      console.warn('Cannot load cluster params: ', e);
      params = {};
    }
  }
  return params;
}
