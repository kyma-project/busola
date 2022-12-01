import jsyaml from 'js-yaml';
import { merge } from 'lodash';
import { useEffect, useRef } from 'react';
import { atom, RecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { clusterState } from './clusterAtom';
import { getFetchFn } from './utils/getFetchFn';
import { ConfigFeatureList } from './types';

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

const getConfigs = async (fetchFn: any) => {
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
        relativeUrl: '/api/v1/namespaces/kube-public/configmaps/busola-config',
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

export const useGetConfiguration = () => {
  const oldCluster = useRef('');
  const cluster = useRecoilValue(clusterState);
  const setConfig = useSetRecoilState(configurationAtom);
  const fetchFn = getFetchFn(useRecoilValue);

  useEffect(() => {
    const setClusterConfig = async () => {
      if (!fetchFn || oldCluster.current === JSON.stringify(cluster)) return;
      oldCluster.current = JSON.stringify(cluster);
      if (!cluster) {
        setConfig(null);
      } else {
        const configs = await getConfigs(fetchFn);
        setConfig(configs);
      }
    };
    setClusterConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, fetchFn]);
};

export const configurationAtom: RecoilState<Configuration> = atom<
  Configuration
>({
  key: 'configurationAtom',
  default: defaultValue,
});
