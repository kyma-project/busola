import jsyaml from 'js-yaml';
import { mapValues } from 'lodash';
import { useEffect } from 'react';
import { ExtResource } from '../types';
import { atom, RecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { clusterState } from '../clusterAtom';
import { authDataState } from '../authDataAtom';
import { getFetchFn } from '../utils/getFetchFn';

type ConfigMapData = {
  general: string;
  list: string;
  form: string;
  details: string;
  dataSources: string;
  translations: string;
  presets: string;
};

type ConfigMapResponse = {
  data: ConfigMapData;
};

type ConfigMapListResponse =
  | {
      items: ConfigMapResponse[];
    }
  | undefined;

const getExtensions = async (fetchFn: any) => {
  if (!fetchFn) {
    return null;
  }

  try {
    const cacheBuster = '?cache-buster=' + Date.now();
    const extensionsResponse = await fetch(
      '/extensions/extensions.yaml' + cacheBuster,
    );

    const defaultExtensions = jsyaml.load(
      await extensionsResponse.text(),
    ) as ExtResource[];

    let configMapResponse: ConfigMapListResponse;
    try {
      const response = await fetchFn({
        relativeUrl:
          '/api/v1/configmaps?labelSelector=busola.io/extension=resource',
      });
      configMapResponse = await response.json();
    } catch (e) {
      console.warn('Cannot load cluster params from the target cluster: ', e);
    }

    const configMaps = configMapResponse?.items || [];
    const configMapsExtensions = configMaps?.map(configMap => {
      const convertYamlToObject: (
        yamlString: string,
      ) => Record<string, any> | null = yamlString => {
        try {
          return jsyaml.load(yamlString, { json: true }) as Record<string, any>;
        } catch (error) {
          console.warn('cannot parse ', yamlString, error);
          return null;
        }
      };
      return mapValues(
        configMap?.data || {},
        convertYamlToObject,
      ) as ExtResource;
    });

    const allExtensions = [...defaultExtensions, ...configMapsExtensions];
    return allExtensions;
  } catch (e) {
    console.warn('Cannot load cluster params: ', e);
    return null;
  }
};

export const useGetExtensions = () => {
  const cluster = useRecoilValue(clusterState);
  const auth = useRecoilValue(authDataState);
  const setExtensions = useSetRecoilState(extensibilityNodesState);
  const fetchFn = getFetchFn(useRecoilValue);

  useEffect(() => {
    const setClusterConfig = async () => {
      if (!cluster) {
        setExtensions(null);
      } else {
        const configs = await getExtensions(fetchFn);
        setExtensions(configs);
      }
    };
    setClusterConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, auth]);
};

const defaultValue = null;
export const extensibilityNodesState: RecoilState<ExtResource[] | null> = atom<
  ExtResource[] | null
>({
  key: 'extensibilityNodesState',
  default: defaultValue,
});
