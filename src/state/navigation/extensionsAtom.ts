import jsyaml from 'js-yaml';
import { mapValues, partial } from 'lodash';
import { useEffect, useState } from 'react';
import { ExtResource, ExtWidgetConfig } from '../types';
import { atom, RecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { clusterState } from '../clusterAtom';
import { authDataState } from '../authDataAtom';
import { getFetchFn } from '../utils/getFetchFn';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { openapiPathIdListSelector } from 'state/openapi/openapiPathIdSelector';
import {
  permissionSetsSelector,
  PermissionSetState,
} from 'state/permissionSetsSelector';
import { shouldNodeBeVisible } from './filters/shouldNodeBeVisible';
import { mapExtResourceToNavNode } from 'state/resourceList/mapExtResourceToNavNode';
import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';
import { doesUserHavePermission } from './filters/permissions';
import { useUrl } from 'hooks/useUrl';
import { K8sResource } from 'types';
import { useFeature } from 'hooks/useFeature';

/*
the order of the overwrting extensions
- extensions that are in currentNamespace (they are overwritten only in that particular ns, you don't want to let someone else to overwrite your extensions)
- extensions that are in kube-public
- the ones from extensions.yaml
- native ones
*/

type ConfigMapData = {
  general: string;
  list: string;
  form: string;
  details: string;
  dataSources: string;
  translations: string;
  presets: string;
};

type ConfigMapResponse = K8sResource & {
  data: ConfigMapData;
};

type ExtResourceWithMetadata = K8sResource & {
  data: ExtResource;
};

type ConfigMapListResponse =
  | {
      items: ConfigMapResponse[];
    }
  | undefined;

const isTheSameNameAndUrl = (
  firstCM: Partial<ExtResource>,
  secondCM: Partial<ExtResource>,
) =>
  firstCM?.general?.name === secondCM?.general?.name &&
  firstCM?.general?.urlPath === secondCM?.general?.urlPath;

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

async function getExtensionConfigMaps(
  fetchFn: FetchFn,
  kubeconfigNamespace: string,
  currentNamespace: string,
  permissionSet: PermissionSetState,
): Promise<Array<ConfigMapResponse>> {
  const clusterCMUrl =
    '/api/v1/configmaps?labelSelector=busola.io/extension=resource';
  const namespacedCMUrl = `/api/v1/namespaces/${currentNamespace ??
    kubeconfigNamespace}/configmaps?labelSelector=busola.io/extension=resource`;

  if (!currentNamespace) {
    const hasAccessToClusterCMList = doesUserHavePermission(
      ['list'],
      { resourceGroupAndVersion: '', resourceKind: 'ConfigMap' },
      permissionSet,
    );

    // user has no access to clusterwide namespace listing, fall back to namespaced listing
    const url = hasAccessToClusterCMList ? clusterCMUrl : namespacedCMUrl;

    try {
      const response = await fetchFn({ relativeUrl: url });
      const configMapResponse: ConfigMapListResponse = await response.json();
      return configMapResponse?.items ?? [];
    } catch (e) {
      console.warn('Cannot load cluster params from the target cluster: ', e);
      return [];
    }
  } else {
    const hasAccessToClusterCMList = doesUserHavePermission(
      ['list'],
      { resourceGroupAndVersion: '', resourceKind: 'ConfigMap' },
      permissionSet,
    );

    const url = hasAccessToClusterCMList ? clusterCMUrl : namespacedCMUrl;

    try {
      const response = await fetchFn({ relativeUrl: url });
      const configMapResponse: ConfigMapListResponse = await response.json();
      return configMapResponse?.items || [];
    } catch (error) {
      return [];
    }
  }
}

const getExtensions = async (
  fetchFn: FetchFn | undefined,
  kubeconfigNamespace = 'kube-public',
  currentNamespace: string,
  permissionSet: PermissionSetState,
) => {
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

    const configMaps = await getExtensionConfigMaps(
      fetchFn,
      kubeconfigNamespace,
      currentNamespace,
      permissionSet,
    );

    const configMapsExtensions = configMaps.reduce(
      (accumulator, currentConfigMap) => {
        const extResourceWithMetadata = {
          ...currentConfigMap,
          data: mapValues(
            currentConfigMap?.data || {},
            convertYamlToObject,
          ) as ExtResource,
        };

        if (!extResourceWithMetadata.data) return accumulator;

        const indexOfTheSameExtension = accumulator.findIndex(ext =>
          isTheSameNameAndUrl(ext.data, extResourceWithMetadata.data),
        );

        if (indexOfTheSameExtension !== -1) {
          const areNamespacesTheSame =
            currentNamespace ===
            accumulator[indexOfTheSameExtension].metadata.namespace;
          if (areNamespacesTheSame) {
            return accumulator;
          }

          accumulator[indexOfTheSameExtension] = extResourceWithMetadata;
          return accumulator;
        }

        return [...accumulator, extResourceWithMetadata];
      },
      [] as ExtResourceWithMetadata[],
    );

    const defaultExtensionsWithoutOverride = defaultExtensions.filter(
      defExt => {
        return configMapsExtensions.every(cmExt => {
          const namespaces = ['kube-public', currentNamespace];

          if (
            namespaces.includes(cmExt.metadata.namespace!) &&
            isTheSameNameAndUrl(cmExt?.data, defExt)
          ) {
            return false;
          }
          return true;
        });
      },
    );

    const configMapsExtensionsDataOnly: ExtResource[] = configMapsExtensions.map(
      cm => cm.data,
    );

    const combinedExtensions = [
      ...defaultExtensionsWithoutOverride,
      ...configMapsExtensionsDataOnly,
    ].filter(ext => !!ext.general);

    return combinedExtensions;
  } catch (e) {
    console.warn('Cannot load extensions: ', e);
    return [];
  }
};

export const useGetExtensions = () => {
  const { isEnabled: isExtensibilityWidgetsEnabled } = useFeature(
    'EXTENSIBILITY_WIDGETS',
  );
  const cluster = useRecoilValue(clusterState);
  const auth = useRecoilValue(authDataState);
  const setExtensions = useSetRecoilState(extensionsState);
  const setWidgets = useSetRecoilState(widgetsState);
  const fetchFn = getFetchFn(useRecoilValue);
  const configuration = useRecoilValue(configurationAtom);
  const features = configuration?.features;
  const openapiPathIdList = useRecoilValue(openapiPathIdListSelector);
  const permissionSet = useRecoilValue(permissionSetsSelector);
  const [nonNamespacedExtensions, setNonNamespacedExtensions] = useState(null);
  const { namespace } = useUrl();

  useEffect(() => {
    const manageExtensions = async () => {
      if (!cluster) {
        setExtensions([]);
        setWidgets([]);
        setNonNamespacedExtensions(null);
        return;
      }

      const configs = await getExtensions(
        fetchFn,
        cluster.currentContext.namespace,
        namespace,
        permissionSet,
      );

      if (!configs) {
        setExtensions([]);
        setWidgets([]);
        setNonNamespacedExtensions(null);
      } else {
        if (!nonNamespacedExtensions) {
          const configSet = {
            configFeatures: features!,
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

          let widgetsConfigs: ExtWidgetConfig[] = [];
          filteredConfigs.filter(config =>
            config?.widgets?.map(widget =>
              widgetsConfigs.push({
                widget,
                general: config.general,
                dataSources: config.dataSources,
              }),
            ),
          );
          setExtensions(filteredConfigs);
          if (isExtensibilityWidgetsEnabled) {
            setWidgets(widgetsConfigs);
          }
        }
      }
    };
    void manageExtensions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, auth, permissionSet, namespace, openapiPathIdList]);
};

// null for defaultValue,
// empty array for value or error
const defaultValue = null;
export const extensionsState: RecoilState<ExtResource[] | null> = atom<
  ExtResource[] | null
>({
  key: 'extensionsState',
  default: defaultValue,
});

export const widgetsState: RecoilState<ExtWidgetConfig[] | null> = atom<
  ExtWidgetConfig[] | null
>({
  key: 'widgetsState',
  default: defaultValue,
});
