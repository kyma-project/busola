import jsyaml from 'js-yaml';
import { isArray, mergeWith } from 'lodash';
import { useEffect, useState } from 'react';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { unwrap } from 'jotai/utils';

import { clusterAtom, ActiveClusterState } from '../clusterAtom';
import { authDataAtom } from '../authDataAtom';
import { getFetchFn } from '../utils/getFetchFn';
import { ConfigFeatureList } from '../types';
import { apiGroupAtom } from '../discoverability/apiGroupsAtom';
import { getFeatures } from './getFeatures';
import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';
import { getConfigDir } from 'shared/utils/env';

const apiGroupAtomSync = unwrap(apiGroupAtom, (prev) => prev ?? null);

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

    // Check if there is config.yaml - case for deploying Busola in a Cluster
    let configParams: Config = {};
    try {
      configParams = jsyaml.load(await configResponse.text()) as Config;
    } catch (e) {
      console.warn('Cannot load config.yaml: ', e);
    }

    const mapParams = configMapResponse?.data?.config
      ? (jsyaml.load(configMapResponse.data.config) as Config)
      : {};

    const customizer = (obj: any, src: any) => {
      if (isArray(obj)) {
        return src;
      }
    };

    // Excludes the cluster's busola-config ConfigMap, so it's trusted for
    // values a cluster admin must not override (the Joule issuer gate).
    const deploymentConfiguration = mergeWith(
      {},
      defaultParams?.config,
      configParams?.config,
      customizer,
    ) as Configuration;

    const configuration = mergeWith(
      {},
      defaultParams?.config,
      configParams?.config,
      mapParams?.config,
      customizer,
    ) as Configuration;

    return { configuration, deploymentConfiguration };
  } catch (e) {
    console.warn('Cannot load cluster params: ', e);
    return { configuration: null, deploymentConfiguration: null };
  }
};

export const useGetConfiguration = () => {
  const cluster = useAtomValue(clusterAtom);
  const auth = useAtomValue(authDataAtom);
  const apis = useAtomValue(apiGroupAtomSync);
  const setConfig = useSetAtom(configurationAtom);
  const setDeploymentConfig = useSetAtom(deploymentConfigurationAtom);
  const fetchFn = getFetchFn(useAtomValue);
  const [prevCluster, setPrevCluster] = useState<ActiveClusterState>(null);
  const [prevHasFetchFn, setPrevHasFetchFn] = useState(false);

  useEffect(() => {
    const hasFetchFn = !!fetchFn;
    const clusterChanged = cluster !== prevCluster;
    const fetchFnBecameAvailable = hasFetchFn && !prevHasFetchFn;

    if (!cluster || clusterChanged || fetchFnBecameAvailable) {
      const setClusterConfig = async () => {
        const { configuration, deploymentConfiguration } =
          await getConfigs(fetchFn);
        const updatedFeatures = await getFeatures(configuration?.features);
        setConfig({ ...configuration, features: updatedFeatures });
        setDeploymentConfig(deploymentConfiguration ?? {});
        setPrevCluster(cluster);
        setPrevHasFetchFn(hasFetchFn);
      };

      setClusterConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, auth, apis]);
};

export const configurationAtom = atom<Configuration>(defaultValue);
configurationAtom.debugLabel = 'configurationAtom';

export const deploymentConfigurationAtom = atom<Configuration>(defaultValue);
deploymentConfigurationAtom.debugLabel = 'deploymentConfigurationAtom';
