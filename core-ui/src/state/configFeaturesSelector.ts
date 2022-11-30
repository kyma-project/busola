import jsyaml from 'js-yaml';
import { selector, RecoilValue } from 'recoil';
import { merge } from 'lodash';

import { ConfigFeatureList } from './types';
import { getFetchFn } from './utils/getFetchFn';

type Config = {
  config?: {
    features: ConfigFeatureList;
  };
};

type ConfigMapResponse =
  | {
      data: {
        config: string;
      };
    }
  | undefined;

type ConfigFeaturesState = ConfigFeatureList | null;

export const configFeaturesState: RecoilValue<ConfigFeaturesState> = selector<
  ConfigFeaturesState
>({
  key: 'configFeaturesState',
  get: async ({ get }) => {
    const fetchFn = getFetchFn(get);
    if (!fetchFn) {
      return null;
    }

    try {
      const cacheBuster = '?cache-buster=' + Date.now();

      const defaultConfigResponse = await fetch(
        '/config/defaultConfig.yaml' + cacheBuster,
      );

      const configResponse = await fetch('/config/config.yaml' + cacheBuster);

      let configMapResponse: ConfigMapResponse;
      try {
        const response = await fetchFn({
          relativeUrl:
            '/api/v1/namespaces/kube-public/configmaps/busola-config',
        });
        configMapResponse = await response.json();
      } catch (e) {
        console.warn('Cannot load cluster params from the target cluster: ', e);
      }

      const defaultParams = jsyaml.load(
        await defaultConfigResponse.text(),
      ) as Config;
      const configParams = jsyaml.load(await configResponse.text()) as Config;
      const mapParams = configMapResponse?.data?.config
        ? (jsyaml.load(configMapResponse.data.config) as Config)
        : {};

      return merge(defaultParams, configParams, mapParams) as ConfigFeatureList;
    } catch (e) {
      console.warn('Cannot load cluster params: ', e);
      return null;
    }
  },
});
