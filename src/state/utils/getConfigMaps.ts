import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';
import { createPostFn } from 'shared/hooks/BackendAPI/usePost';
import { doesUserHavePermission } from 'state/navigation/filters/permissions';
import {
  PermissionSetState,
  getPermissionResourceRules,
} from 'state/permissionSetsSelector';
import { K8sResource } from 'types';

export type ConfigMapData = {
  [key: string]: string;
};

export type ConfigMapResponse = K8sResource & {
  data: ConfigMapData;
};

type ConfigMapListResponse =
  | {
      items: ConfigMapResponse[];
    }
  | undefined;

export async function getConfigMaps(
  fetchFn: FetchFn | undefined,
  kubeconfigNamespace = 'kube-public',
  currentNamespace: string,
  permissionSet: PermissionSetState,
  labelSelector: string,
) {
  if (!fetchFn) return null;

  const clusterCMUrl = `/api/v1/configmaps?labelSelector=${labelSelector}`;
  const namespacedCMUrl = `/api/v1/namespaces/${currentNamespace ??
    kubeconfigNamespace}/configmaps?labelSelector=${labelSelector}`;

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

  // user has no access to clusterwide namespace listing, fall back to namespaced listing
  const url = clusterAccess
    ? clusterCMUrl
    : namespaceAccess
    ? namespacedCMUrl
    : '';

  try {
    const response = await fetchFn({ relativeUrl: url });
    const configMapResponse: ConfigMapListResponse = await response.json();
    return configMapResponse?.items ?? [];
  } catch (e) {
    console.warn('Cannot load cluster params from the target cluster: ', e);
    return [];
  }
}
