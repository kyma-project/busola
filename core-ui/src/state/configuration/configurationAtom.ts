import jsyaml from 'js-yaml';
import { merge } from 'lodash';
import { RecoilValue, selector } from 'recoil';

import { authDataState } from '../authDataAtom';
import { getFetchFn } from '../utils/getFetchFn';
import { ConfigFeatureList } from '../types';
import { apiGroupState } from '..//discoverability/apiGroupsSelector';
import { getPrometheusConfig } from './prometheusFeature';
import { getFeatures } from './getFeatures';
import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';
import { clusterState } from 'state/clusterAtom';

type Configuration = {
  features?: ConfigFeatureList;
  storageType?: string;
} | null;

type Config = {
  config?: Configuration;
} | null;

type ConfigMapResponse =
  | {
      data: {
        config: string;
      };
    }
  | undefined;

const getConfigs = async (fetchFn: FetchFn | undefined) => {
  try {
    const cacheBuster = '?cache-buster=' + Date.now();

    const defaultConfigResponse = await fetch(
      '/defaultConfig.yaml' + cacheBuster,
    );

    const configResponse = await fetch('/config/config.yaml' + cacheBuster);

    let configMapResponse: ConfigMapResponse;
    if (fetchFn) {
      try {
        const response = await fetchFn({
          relativeUrl:
            '/api/v1/namespaces/kube-public/configmaps/busola-config',
        });
        configMapResponse = await response.json();
      } catch (e) {
        console.warn('Cannot load cluster params from the target cluster: ', e);
      }
    }

    const defaultParams = jsyaml.load(
      await defaultConfigResponse.text(),
    ) as Config;
    const configParams = jsyaml.load(await configResponse.text()) as Config;
    const mapParams = configMapResponse?.data?.config
      ? (jsyaml.load(configMapResponse.data.config) as Config)
      : {};

    console.log({
      'defaultParams?.config': defaultParams?.config,
      'configParams?.config': configParams?.config,
      'mapParams?.config': mapParams?.config,
    });

    return merge(
      defaultParams?.config,
      configParams?.config,
      mapParams?.config,
    ) as Configuration;
  } catch (e) {
    console.warn('Cannot load cluster params: ', e);
    return null;
  }
};

export const configurationAtom: RecoilValue<Configuration> = selector<
  Configuration
>({
  key: 'configurationAtom',
  get: async ({ get }) => {
    const cluster = get(clusterState);
    const auth = get(authDataState);
    const apis = get(apiGroupState);
    const fetchFn = getFetchFn(get);

    if (!fetchFn && !!cluster) {
      console.log('null', { fetchFn, auth, cluster });
      return null;
    }

    const configs = await getConfigs(fetchFn);
    if (configs?.features) {
      configs.features.PROMETHEUS = getPrometheusConfig(auth, apis, fetchFn);
    }
    const updatedFeatures = await getFeatures(configs?.features);
    console.log('nie null', { ...configs, features: updatedFeatures });
    return { ...configs, features: updatedFeatures };
  },
});
