import jsyaml from 'js-yaml';
import { mergeWith, isArray } from 'lodash';
import { useEffect } from 'react';
import { atom, RecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { clusterState } from '../clusterAtom';
import { authDataState } from '../authDataAtom';
import { getFetchFn } from '../utils/getFetchFn';
import { ConfigFeatureList } from '../types';
import { apiGroupState } from '..//discoverability/apiGroupsSelector';
import { getPrometheusConfig } from './prometheusFeature';
import { getFeatures } from './getFeatures';
import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';

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

const defaultValue: Configuration = {};

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

    const mapParams1: Config = {
      config: {
        features: {
          EXTENSIBILITY: {
            isEnabled: true,
          },
          PROTECTED_RESOURCES: {
            isEnabled: true,
            config: {
              resources: [
                {
                  match: {
                    "$.metadata.labels['app.kubernetes.io/created-by']":
                      'ConfigMap',
                  },
                  message: 'Locked resource. ConfigMap.',
                },
              ],
            },
          },
        },
      },
    };

    const configParams1: Config = {
      config: {
        features: {
          PROTECTED_RESOURCES: {
            isEnabled: true,
            config: {
              resources: [
                {
                  match: {
                    "$.metadata.labels['app.kubernetes.io/created-by']":
                      'Dev Config',
                  },
                  message: 'Locked resource. Dev Config.',
                },
                {
                  match: {
                    "$.metadata.labels['app.kubernetes.io/created-by']":
                      'Env Config',
                  },
                  message: 'Locked resource. Env Config.',
                },
              ],
            },
          },
        },
      },
    };

    const customizer = (obj: any, src: any) => {
      if (isArray(obj)) {
        return src;
      }
    };

    const merged = mergeWith(
      defaultParams?.config,
      configParams1?.config,
      mapParams1?.config,
      customizer,
    ) as Configuration;
    console.log('lolo merged', jsyaml.dump(merged));
    return merged;
  } catch (e) {
    console.warn('Cannot load cluster params: ', e);
    return null;
  }
};

export const useGetConfiguration = () => {
  const cluster = useRecoilValue(clusterState);
  const auth = useRecoilValue(authDataState);
  const apis = useRecoilValue(apiGroupState);
  const setConfig = useSetRecoilState(configurationAtom);
  const fetchFn = getFetchFn(useRecoilValue);

  useEffect(() => {
    const setClusterConfig = async () => {
      const configs = await getConfigs(fetchFn);
      if (configs?.features) {
        configs.features.PROMETHEUS = getPrometheusConfig(auth, apis, fetchFn);
      }
      const updatedFeatures = await getFeatures(configs?.features);
      console.log('updatedFeatures', updatedFeatures);
      setConfig({ ...configs, features: updatedFeatures });
    };
    setClusterConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, auth, apis]);
};

export const configurationAtom: RecoilState<Configuration> = atom<
  Configuration
>({
  key: 'configurationAtom',
  default: defaultValue,
});
