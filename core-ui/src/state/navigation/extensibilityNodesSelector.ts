import jsyaml from 'js-yaml';
import { RecoilValueReadOnly, selector } from 'recoil';
import { mapValues } from 'lodash';

import { NavNode, ExtResource } from '../types';
import { getFetchFn } from '../utils/getFetchFn';
import { mapExtResourceToNavNode } from '../resourceList/mapExtResourceToNavNode';

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

export const extensibilityNodesState: RecoilValueReadOnly<
  NavNode[] | null
> = selector<NavNode[] | null>({
  key: 'extensibilityNodesState',
  get: async ({ get }) => {
    const fetchFn = getFetchFn(get);
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
            return jsyaml.load(yamlString, { json: true }) as Record<
              string,
              any
            >;
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
      return allExtensions?.map(ext => mapExtResourceToNavNode(ext));
    } catch (e) {
      console.warn('Cannot load cluster params: ', e);
      return null;
    }
  },
});
