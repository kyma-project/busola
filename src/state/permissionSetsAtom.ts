import { isEqual } from 'lodash';
import { atom } from 'jotai';
import { PostFn } from 'shared/hooks/BackendAPI/usePost';
import { activeNamespaceIdAtom } from './activeNamespaceIdAtom';
import { clusterAtom } from './clusterAtom';
import { getPostFn } from './utils/getPostFn';

export function hasAnyRoleBound(permissionSet: PermissionSetState) {
  const ssrr = {
    apiGroups: ['authorization.k8s.io'],
    resources: ['selfsubjectaccessreviews', 'selfsubjectrulesreviews'],
    verbs: ['create'],
  };

  const filterSelfSubjectRulesReview = (permission: PermissionSet) =>
    !isEqual(permission, ssrr);

  // leave out ssrr permission, as it's always there
  permissionSet = permissionSet.filter(filterSelfSubjectRulesReview);

  const verbs = permissionSet.flatMap((p) => p.verbs);

  const usefulVerbs = [
    'get',
    'list',
    'watch',
    'create',
    'update',
    'patch',
    'delete',
    '*',
  ];

  return verbs.some((v) => usefulVerbs.includes(v));
}

export async function getPermissionResourceRules(
  postFn: PostFn,
  namespaceId?: string,
  clusterWide?: boolean,
) {
  const namespaceName = clusterWide || !namespaceId ? '*' : namespaceId;
  const path = '/apis/authorization.k8s.io/v1/selfsubjectrulesreviews';
  const ssrr = {
    typeMeta: {
      kind: 'SelfSubjectRulesReview',
      APIVersion: 'authorization.k8s.io/v1',
    },
    spec: { namespace: namespaceName },
  };

  const permissions = await postFn(path, ssrr, {});

  const resourceRules: PermissionSetState = permissions.status.resourceRules;
  return resourceRules;
}

export type PermissionSet = {
  verbs: string[];
  apiGroups: string[];
  resources: string[];
  resourceNames?: string[];
};

export type PermissionSetState = PermissionSet[];

export const permissionSetsAtom = atom<Promise<PermissionSetState>>(
  async (get) => {
    const cluster = get(clusterAtom);
    const activeNamespaceId = get(activeNamespaceIdAtom) || '';
    const postFn = getPostFn(get);

    if (postFn) {
      try {
        const resourceRules = await getPermissionResourceRules(
          postFn,
          activeNamespaceId,
        );

        if (
          !hasAnyRoleBound(resourceRules) &&
          !window.location.href.endsWith('/no-permissions')
        ) {
          window.location.href =
            window.origin + `/cluster/${cluster?.contextName}/no-permissions`;
        }
        return resourceRules;
      } catch (e) {
        console.error('Permissions error:' + e);
        return [];
      }
    }
    return [];
  },
);
permissionSetsAtom.debugLabel = 'permissionSetsAtom';
