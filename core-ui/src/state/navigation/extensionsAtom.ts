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

    let defaultExtensions = jsyaml.loadAll(
      await extensionsResponse.text(),
    ) as ExtResource[];

    if (Array.isArray(defaultExtensions[0]))
      defaultExtensions = defaultExtensions[0];

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
  const setExtensions = useSetRecoilState(extensionsState);
  const fetchFn = getFetchFn(useRecoilValue);

  useEffect(() => {
    const manageExtensions = async () => {
      if (!cluster) {
        setExtensions(null);
      } else {
        const configs = await getExtensions(fetchFn);
        setExtensions(configs);
      }
    };
    manageExtensions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, auth]);
};

const defaultValue = null;
export const extensionsState: RecoilState<ExtResource[] | null> = atom<
  ExtResource[] | null
>({
  key: 'extensionsState',
  default: defaultValue,
});
