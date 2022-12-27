import jsyaml from 'js-yaml';
import { mapValues, partial } from 'lodash';
import { useEffect } from 'react';
import { ExtResource } from '../types';
import {
  atom,
  RecoilState,
  RecoilValue,
  selector,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { clusterState } from '../clusterAtom';
import { authDataState } from '../authDataAtom';
import { getFetchFn } from '../utils/getFetchFn';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { openapiPathIdListSelector } from 'state/openapi/openapiPathIdSelector';
import { permissionSetsSelector } from 'state/permissionSetsSelector';
import { shouldNodeBeVisible } from './filters/shouldNodeBeVisible';
import { mapExtResourceToNavNode } from 'state/resourceList/mapExtResourceToNavNode';

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
    const extensionsResponse = await fetch('/extensions/extensions.yaml');

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

export const extensionsState: RecoilValue<ExtResource[] | null> = selector<
  ExtResource[] | null
>({
  key: 'extensionsState',
  get: async ({ get }) => {
    const cluster = get(clusterState);
    const fetchFn = getFetchFn(get);
    const configuration = get(configurationAtom);
    const openapiPathIdList = get(openapiPathIdListSelector);
    const permissionSet = get(permissionSetsSelector);
    if (!cluster) {
      return null;
    } else {
      const configs = await getExtensions(fetchFn);
      if (!configs) {
        return null;
      } else {
        const configSet = {
          configFeatures: configuration?.features!,
          openapiPathIdList,
          permissionSet,
        };
        const isNodeVisibleForCurrentConfigSet = partial(
          shouldNodeBeVisible,
          configSet,
        );
        const filteredConfigs = configs.filter(node =>
          isNodeVisibleForCurrentConfigSet(mapExtResourceToNavNode(node)),
        );
        return filteredConfigs;
      }
    }
  },
});
