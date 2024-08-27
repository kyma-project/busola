import jsyaml from 'js-yaml';
import { isArray, mergeWith } from 'lodash';
import { useEffect } from 'react';
import { atom, RecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { clusterState } from '../clusterAtom';
import { authDataState } from '../authDataAtom';
import { getFetchFn } from '../utils/getFetchFn';
import { ConfigFeatureList } from '../types';
import { apiGroupState } from '..//discoverability/apiGroupsSelector';
import { getFeatures } from './getFeatures';
import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';
import getConfigFileLocation from '../../shared/utils/env';
import getConfigDir from '../../shared/utils/env';

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

    const defaultParams = jsyaml.load(
      await defaultConfigResponse.text(),
    ) as Config;

    //use memo, get and etc
    const configDir = await getConfigDir();
    const configResponse = await fetch(
      configDir + '/config/config.yaml' + cacheBuster,
    );

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

    const configParams = jsyaml.load(await configResponse.text()) as Config;
    const mapParams = configMapResponse?.data?.config
      ? (jsyaml.load(configMapResponse.data.config) as Config)
      : {};

    const customizer = (obj: any, src: any) => {
      if (isArray(obj)) {
        return src;
      }
    };

    return mergeWith(
      defaultParams?.config,
      configParams?.config,
      mapParams?.config,
      customizer,
    ) as Configuration;
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
      const updatedFeatures = await getFeatures(configs?.features);
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
