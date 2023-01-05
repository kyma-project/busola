import jsyaml from 'js-yaml';
import { mapValues, partial } from 'lodash';
import { useEffect, useState } from 'react';
import { ExtResource } from '../types';
import {
  atom,
  RecoilState,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
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

// to juz jest: pobieranie permisionow jak jetesmy na klastrze i namespace, fallback zeby pobierac w scope namespace jesli ten z klastra sie nie powiodl,

//tego nie ma:
// pobierz extensiony ze scopu namespace w momencie gdy globalny sie nie powiedzie
//+ test

// stretch:
// problem z gatewayami ->
// widgety ktore pobieraja dane powinny obslugiwac przypadki
// 1. god mode, mamy wszystko, nic nie obslugujemy
// 2.  call po wszystkie resourcy ze wszystkich namespaców nie powiedzie sie, wiec robimy drugi ktory sprawdza czy mamy dostep do tych naszego namespace'a - pokazuje ostrzezenie, ze np. lista moze byc niekompletna
// 3. brak calkowitych uprawnien, mozesz wpisac z palca, ale nie gwarantujemy ze bedzie git, stosowny powod
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
  //sprawdzic czy jest currentnamespace
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
    // + domergowanie listy dla current namespace jesśli istnieje + nie robimy tego calla jeśli mieliśmy dostęp do wszystkich CM  doesUserHavePermission oraz fetch pod `/api/v1/namespaces/${currentNamespace}/configmaps?labelSelector=busola.io/extension=resource`;
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

    const configMapsExtensions = configMaps.map(configMap => {
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

    return [...defaultExtensions, ...configMapsExtensions].filter(
      e => !!e.general,
    );
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
        setNonNamespacedExtensions(null);
      } else {
        const configs = await getExtensions(
          fetchFn,
          cluster.currentContext.namespace,
          namespace,
          permissionSet,
        );
        console.log('configs');
        if (!configs) {
          setExtensions([]);
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
            setExtensions(extensions => [
              ...(extensions || []),
              ...filteredConfigs,
            ]);
          }

          // if (namespace) {
          //   const hasAccessToClusterCMList = doesUserHavePermission(
          //     ['list'],
          //     { resourceGroupAndVersion: '', resourceKind: 'ConfigMap' },
          //     permissionSet,
          //   );
          // }
        }
      }
    };

    void manageExtensions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, auth, permissionSet, namespace, openapiPathIdList]);
};

const defaultValue = null;
export const extensionsState: RecoilState<ExtResource[] | null> = atom<
  ExtResource[] | null
>({
  key: 'extensionsState',
  default: defaultValue,
});
