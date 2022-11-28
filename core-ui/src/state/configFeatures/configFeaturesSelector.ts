import { selector, RecoilValue } from 'recoil';
import { ConfigFeatureList } from '../types';
import jsyaml from 'js-yaml';
import { merge } from 'lodash';

type Config = {
  config?: {
    features: ConfigFeatureList;
  };
};

type ConfigFeaturesState = ConfigFeatureList | null;

export const configFeaturesState: RecoilValue<ConfigFeaturesState> = selector<
  ConfigFeaturesState
>({
  key: 'configFeaturesState',
  get: async () => {
    try {
      const cacheBuster = '?cache-buster=' + Date.now();

      const defaultConfigResponse = await fetch(
        '/defaultConfig.yaml' + cacheBuster,
      );

      const configMapResponse = await fetch(
        '/config/config.yaml' + cacheBuster,
      );

      const defaultParams = jsyaml.load(
        await defaultConfigResponse.text(),
      ) as Config;
      const mapParams = jsyaml.load(await configMapResponse.text()) as Config;

      return merge(defaultParams, mapParams) as ConfigFeatureList;
    } catch (e) {
      console.warn('Cannot load cluster params: ', e);
      return null;
    }
  },
});
