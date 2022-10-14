import { merge } from 'lodash';
import { convertStaticFeatures } from './feature-discovery';
import jsyaml from 'js-yaml';

let params = null;

export async function getBusolaClusterParams() {
  if (!params) {
    try {
      const cacheBuster = '?cache-buster=' + Date.now();

      // workaround, to delete after updating stage and prod with YAMLs
      let defaultConfigResponse = await fetch(
        '/assets/defaultConfig.yaml' + cacheBuster,
      );
      if (
        defaultConfigResponse.status >= 400 ||
        defaultConfigResponse.headers.get('Content-Type')
      ) {
        console.warn('Cannot load cluster YAML params: ', e);
        defaultConfigResponse = await fetch(
          '/assets/defaultConfig.json' + cacheBuster,
        );
      }
      // workaround, to delete after updating stage and prod with YAMLs
      let configMapResponse = await fetch(
        '/assets/config/config.yaml' + cacheBuster,
      );
      if (
        configMapResponse.status >= 400 ||
        configMapResponse.headers.get('Content-Type')
      ) {
        console.warn('Cannot load cluster YAML params: ', e);
        configMapResponse = await fetch(
          '/assets/config/config.json' + cacheBuster,
        );
      }

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
