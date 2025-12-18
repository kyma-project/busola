import { configFeaturesNames, ExtWizardConfig } from './../types';
import jsyaml from 'js-yaml';
import { mapValues, partial } from 'lodash';
import { useEffect } from 'react';
import { ExtInjectionConfig, ExtResource } from '../types';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { clusterAtom } from '../clusterAtom';
import { authDataAtom } from '../authDataAtom';
import { refreshExtenshionsAtom } from '../refreshExtenshionsAtom';
import { getFetchFn } from '../utils/getFetchFn';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { openapiPathIdListAtom } from 'state/openapi/openapiPathIdAtom';
import {
  getPermissionResourceRules,
  permissionSetsAtom,
  PermissionSetState,
} from 'state/permissionSetsAtom';
import { shouldNodeBeVisible } from './filters/shouldNodeBeVisible';
import { mapExtResourceToNavNode } from 'state/resourceList/mapExtResourceToNavNode';
import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';
import { doesUserHavePermission } from './filters/permissions';
import { useUrl } from 'hooks/useUrl';
import { K8sResource } from 'types';
import { useFeature } from 'hooks/useFeature';
import { RESOURCE_PATH } from 'hooks/useMessageList';
import pluralize from 'pluralize';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { CustomResourceDefinition } from 'command-pallette/CommandPalletteUI/handlers/crHandler';
import { createPostFn } from 'shared/hooks/BackendAPI/usePost';
import { getConfigDir } from 'shared/utils/env';

/*
the order of the overwrting extensions
- extensions that are in currentNamespace (they are overwritten only in that particular ns, you don't want to let someone else to overwrite your extensions)
- extensions that are in kyma-system
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
  customScript: string;
  customHtml: string;
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

interface ExtensionProps {
  kymaFetchFn: (_url: string, _options?: any) => Promise<Response>;
}

const isTheSameNameAndUrl = (
  firstCM: Partial<ExtResource>,
  secondCM: Partial<ExtResource>,
) =>
  firstCM?.general?.name === secondCM?.general?.name &&
  firstCM?.general?.urlPath === secondCM?.general?.urlPath;

const isTheSameId = (
  firstCM: Partial<ExtResource>,
  secondCM: Partial<ExtResource>,
) => firstCM?.general?.id === secondCM?.general?.id;

const convertYamlToObject = (
  yamlString: string,
): Record<string, any> | null => {
  try {
    return jsyaml.load(yamlString, { json: true }) as Record<string, any>;
  } catch (error) {
    console.warn('cannot parse ', yamlString, error);
    return null;
  }
};

async function getConfigMapsWithSelector(
  fetchFn: FetchFn,
  kubeconfigNamespace: string,
  currentNamespace: string,
  permissionSet: PermissionSetState,
  selector: string,
): Promise<Array<ConfigMapResponse>> {
  const clusterCMUrl = `/api/v1/configmaps?labelSelector=${selector}`;
  const namespacedCMUrl = `/api/v1/namespaces/${
    currentNamespace ?? kubeconfigNamespace
  }/configmaps?labelSelector=${selector}`;

  const namespaceAccess = doesUserHavePermission(
    ['list'],
    { resourceGroupAndVersion: '', resourceKind: 'ConfigMap' },
    permissionSet,
  );

  const postFn = createPostFn(fetchFn);
  const clusterPermissionSet = await getPermissionResourceRules(
    postFn,
    '',
    true,
  );
  const clusterAccess = doesUserHavePermission(
    ['list'],
    { resourceGroupAndVersion: '', resourceKind: 'ConfigMap' },
    clusterPermissionSet,
  );

  // if user has no access to clusterwide namespace listing, fall back to namespaced listing
  const url = clusterAccess
    ? clusterCMUrl
    : namespaceAccess
      ? namespacedCMUrl
      : '';

  if (!currentNamespace) {
    try {
      const response = await fetchFn({ relativeUrl: url });
      const configMapResponse: ConfigMapListResponse = await response.json();
      return configMapResponse?.items ?? [];
    } catch (e) {
      console.warn('Cannot load cluster params from the target cluster: ', e);
      return [];
    }
  } else {
    try {
      const response = await fetchFn({ relativeUrl: url });
      const configMapResponse: ConfigMapListResponse = await response.json();
      return configMapResponse?.items || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}

const getExtensionWizards = async (
  fetchFn: FetchFn | undefined,
  kubeconfigNamespace = 'kube-public',
  currentNamespace: string,
  permissionSet: PermissionSetState,
) => {
  if (!fetchFn) {
    return null;
  }
  try {
    const configDir = await getConfigDir();
    const wizardsResponse = await fetch(configDir + '/extensions/wizards.yaml');

    let defaultWizards = jsyaml.loadAll(
      await wizardsResponse.text(),
    ) as ExtResource[];

    if (Array.isArray(defaultWizards[0])) defaultWizards = defaultWizards[0];

    const configMaps = await getConfigMapsWithSelector(
      fetchFn,
      kubeconfigNamespace,
      currentNamespace,
      permissionSet,
      'busola.io/extension=wizard',
    );

    const configMapWizards = configMaps.reduce(
      (accumulator, currentConfigMap) => {
        const extResourceWithMetadata = {
          ...currentConfigMap,
          data: mapValues(
            currentConfigMap?.data || {},
            convertYamlToObject,
          ) as ExtResource,
        };

        if (!extResourceWithMetadata.data) return accumulator;

        const indexOfTheSameExtension = accumulator.findIndex((ext) =>
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

    const defaultWizardsWithoutOverride = defaultWizards.filter((defExt) => {
      return configMapWizards.every((cmExt) => {
        const namespaces = ['kube-public', 'kyma-system', currentNamespace];

        if (
          namespaces.includes(cmExt.metadata.namespace!) &&
          isTheSameId(cmExt?.data, defExt)
        ) {
          return false;
        }
        return true;
      });
    });
    const configMapWizardsDataOnly: ExtResource[] = configMapWizards.map(
      (cm) => cm.data,
    );
    const combinedWizards = [
      ...defaultWizardsWithoutOverride,
      ...configMapWizardsDataOnly,
    ];
    return combinedWizards;
  } catch (e) {
    console.warn('Cannot load wizards: ', e);
    return [];
  }
};

const getStatics = async (
  fetchFn: FetchFn | undefined,
  kubeconfigNamespace = 'kube-public',
  currentNamespace: string,
  permissionSet: PermissionSetState,
) => {
  if (!fetchFn) {
    return null;
  }
  try {
    const configDir = await getConfigDir();
    const staticsResponse = await fetch(configDir + '/extensions/statics.yaml');

    let defaultStatics = jsyaml.loadAll(
      await staticsResponse.text(),
    ) as ExtResource[];

    if (Array.isArray(defaultStatics[0])) defaultStatics = defaultStatics[0];

    const configMaps = await getConfigMapsWithSelector(
      fetchFn,
      kubeconfigNamespace,
      currentNamespace,
      permissionSet,
      'busola.io/extension=statics',
    );

    const configMapStatics = configMaps.reduce(
      (accumulator, currentConfigMap) => {
        const extResourceWithMetadata = {
          ...currentConfigMap,
          data: mapValues(
            currentConfigMap?.data || {},
            convertYamlToObject,
          ) as ExtResource,
        };

        if (!extResourceWithMetadata.data) return accumulator;

        return [...accumulator, extResourceWithMetadata];
      },
      [] as ExtResourceWithMetadata[],
    );

    const configMapStaticsDataOnly: ExtResource[] = configMapStatics.map(
      (cm) => cm.data,
    );
    const combinedStatics = [...defaultStatics, ...configMapStaticsDataOnly];
    return combinedStatics;
  } catch (e) {
    console.warn('Cannot load statics: ', e);
    return [];
  }
};

const getExtensions = async (
  fetchFn: FetchFn | undefined,
  kubeconfigNamespace = 'kube-public',
  currentNamespace: string,
  permissionSet: PermissionSetState,
  extCustomComponentsEnabled: boolean,
) => {
  if (!fetchFn) {
    return null;
  }

  try {
    const configDir = await getConfigDir();
    const extensionsResponse = await fetch(
      configDir + '/extensions/extensions.yaml',
    );

    let defaultExtensions = jsyaml.loadAll(
      await extensionsResponse.text(),
    ) as ExtResource[];

    if (Array.isArray(defaultExtensions[0]))
      defaultExtensions = defaultExtensions[0];

    const configMaps = await getConfigMapsWithSelector(
      fetchFn,
      kubeconfigNamespace,
      currentNamespace,
      permissionSet,
      'busola.io/extension=resource',
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

        if (extCustomComponentsEnabled) {
          extResourceWithMetadata.data.customHtml =
            currentConfigMap.data.customHtml || '';
          extResourceWithMetadata.data.customScript =
            currentConfigMap.data.customScript || '';
        }
        if (!extResourceWithMetadata.data) return accumulator;

        const indexOfTheSameExtension = accumulator.findIndex((ext) =>
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
      (defExt) => {
        return configMapsExtensions.every((cmExt) => {
          const namespaces = ['kube-public', 'kyma-system', currentNamespace];

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

    const configMapsExtensionsDataOnly: ExtResource[] =
      configMapsExtensions.map((cm) => cm.data);

    const combinedExtensions = [
      ...defaultExtensionsWithoutOverride,
      ...configMapsExtensionsDataOnly,
    ].filter((ext) => !!ext.general);
    return combinedExtensions;
  } catch (e) {
    console.warn('Cannot load extensions: ', e);
    return [];
  }
};

const pushExtToEventTypes = (extensions: any) => {
  extensions.forEach((ext: any) => {
    RESOURCE_PATH[ext?.general?.resource?.kind as keyof typeof RESOURCE_PATH] =
      pluralize(ext?.general?.resource?.kind).toLocaleLowerCase();
  });
};

export const useGetExtensions = () => {
  const cluster = useAtomValue(clusterAtom);
  const auth = useAtomValue(authDataAtom);
  const refreshExtenshions = useAtomValue(refreshExtenshionsAtom);
  const setExtensions = useSetAtom(extensionsAtom);
  const setStatics = useSetAtom(staticsAtom);
  const setAllExtensions = useSetAtom(allExtensionsAtom);
  const setInjections = useSetAtom(injectionsAtom);
  const setWizard = useSetAtom(wizardAtom);
  const fetchFn = getFetchFn(useAtomValue);
  const configuration = useAtomValue(configurationAtom);
  const features = configuration?.features;
  const openapiPathIdList = useAtomValue(openapiPathIdListAtom);
  const permissionSet = useAtomValue(permissionSetsAtom);
  const { namespace } = useUrl();
  const { isEnabled: isExtensibilityInjectionsEnabled } = useFeature(
    configFeaturesNames.EXTENSIBILITY_INJECTIONS,
  );
  const { isEnabled: isExtensibilityWizardEnabled } = useFeature(
    configFeaturesNames.EXTENSIBILITY_WIZARD,
  );
  const { isEnabled: isExtensibilityCustomComponentsEnabled } = useFeature(
    configFeaturesNames.EXTENSIBILITY_CUSTOM_COMPONENTS,
  );
  const { data: crds } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`,
  );

  useEffect(() => {
    if (isExtensibilityCustomComponentsEnabled) {
      // Wrap busola fetch function to be able to use it in the extensions as regular fetch.
      // It reduces the learning curve for the extension developers and introduces loose coupling between Busola and the extensions.
      function asRegularFetch(busolaFetch: FetchFn, url: string, options: any) {
        return busolaFetch({
          relativeUrl: url,
          init: options,
          abortController: options?.signal
            ? {
                signal: options?.signal,
                abort: () => {},
              }
            : undefined,
        });
      }

      if (fetchFn) {
        (
          window as Window & {
            extensionProps?: ExtensionProps;
          }
        ).extensionProps = {
          kymaFetchFn: (url: string, options: any) =>
            asRegularFetch(fetchFn, url, options),
        };
      }
    }

    return () => {
      delete (window as Window & { extensionProps?: ExtensionProps })
        .extensionProps;
    };
  }, [fetchFn, auth, isExtensibilityCustomComponentsEnabled]);

  useEffect(() => {
    (crds as any)?.items.forEach((crd: CustomResourceDefinition) => {
      RESOURCE_PATH[crd?.spec.names.kind as keyof typeof RESOURCE_PATH] =
        'customresources/' + crd?.metadata.name;
    });
  }, [crds]);

  useEffect(() => {
    const manageExtensions = async () => {
      if (!cluster) {
        setExtensions([]);
        setStatics([]);
        setAllExtensions([]);
        setInjections([]);
        setWizard([]);
        return;
      }

      const configs = await getExtensions(
        fetchFn,
        cluster.currentContext.namespace || 'kube-public',
        namespace,
        permissionSet,
        isExtensibilityCustomComponentsEnabled ?? false,
      );

      const statics = await getStatics(
        fetchFn,
        cluster.currentContext.namespace,
        namespace,
        permissionSet,
      );

      const wizardConfigs = await getExtensionWizards(
        fetchFn,
        cluster.currentContext.namespace || 'kube-public',
        namespace,
        permissionSet,
      );

      if (!wizardConfigs || !isExtensibilityWizardEnabled) {
        setWizard([]);
      } else {
        setWizard(wizardConfigs as any);
        // TODO wizard injections
      }

      const filteredConfigs: ExtResource[] = [];
      if (!configs) {
        setExtensions([]);
        setAllExtensions([]);
      } else {
        const configSet = {
          configFeatures: features!,
          openapiPathIdList,
          permissionSet,
        };

        const isNodeVisibleForCurrentConfigSet = partial(
          shouldNodeBeVisible,
          configSet,
        );

        configs
          .filter((node) =>
            !(node?.general?.resource === null)
              ? true
              : isNodeVisibleForCurrentConfigSet(mapExtResourceToNavNode(node)),
          )
          .forEach((i) => filteredConfigs.push(i));

        setExtensions(filteredConfigs);
        setAllExtensions(configs);
        pushExtToEventTypes(filteredConfigs);
      }

      if (!filteredConfigs && !statics) {
        setStatics([]);
        setInjections([]);
      } else {
        const injectionsConfigs: ExtInjectionConfig[] = [];
        filteredConfigs.forEach((config) =>
          config?.injections?.map((injection) =>
            injectionsConfigs.push({
              injection: injection,
              general: config.general,
              dataSources: config.dataSources,
            }),
          ),
        );
        (statics || []).forEach((config) =>
          config?.injections?.map((injection) =>
            injectionsConfigs.push({
              injection: injection,
              general: {
                ...config.general,
                type: 'static',
              },
              dataSources: config.dataSources,
            }),
          ),
        );
        setStatics(statics);
        if (isExtensibilityInjectionsEnabled) {
          setInjections(injectionsConfigs);
        }
      }
    };
    void manageExtensions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cluster,
    auth,
    permissionSet,
    namespace,
    openapiPathIdList,
    features,
    refreshExtenshions,
  ]);
};

// null for defaultValue,
// empty array for value or error
const defaultValue = null;
export const extensionsAtom = atom<ExtResource[] | null>(defaultValue);
extensionsAtom.debugLabel = 'extensionsAtom';

export const staticsAtom = atom<ExtResource[] | null>(defaultValue);
staticsAtom.debugLabel = 'staticsAtom';

export const allExtensionsAtom = atom<ExtResource[] | null>(defaultValue);
allExtensionsAtom.debugLabel = 'allExtensionsAtom';

export const injectionsAtom = atom<ExtInjectionConfig[] | null>(defaultValue);
injectionsAtom.debugLabel = 'injectionsAtom';

export const wizardAtom = atom<ExtWizardConfig[] | null>(defaultValue);
wizardAtom.debugLabel = 'wizardAtom';
