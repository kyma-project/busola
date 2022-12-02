import { isEqual } from 'lodash';
import { RecoilValue, selector } from 'recoil';
import { activeNamespaceIdState } from './activeNamespaceIdAtom';
import { clusterState } from './clusterAtom';
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

  const verbs = permissionSet.flatMap(p => p.verbs);

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

  return verbs.some(v => usefulVerbs.includes(v));
}

export type PermissionSet = {
  verbs: string[];
  apiGroups: string[];
  resources: string[];
};

export type PermissionSetState = PermissionSet[];

export const permissionSetsSelector: RecoilValue<PermissionSetState> = selector<
  PermissionSetState
>({
  key: 'PermissionSet',
  get: async ({ get }) => {
    const cluster = get(clusterState);
    const activeNamespaceId =
      get(activeNamespaceIdState) || cluster?.currentContext.namespace;
    const postFn = getPostFn(get);

    if (postFn) {
      const namespaceName = activeNamespaceId ? activeNamespaceId : '*';
      const path = '/apis/authorization.k8s.io/v1/selfsubjectrulesreviews';
      const ssrr = {
        typeMeta: {
          kind: 'SelfSubjectRulesReview',
          APIVersion: 'authorization.k8s.io/v1',
        },
        spec: { namespace: namespaceName },
      };

      try {
        const permissions = await postFn(path, ssrr, {});
        const resourceRules: PermissionSetState =
          permissions.status.resourceRules;

        if (
          !hasAnyRoleBound(resourceRules) &&
          !window.location.href.endsWith('/no-permissions')
        ) {
          window.location.href =
            window.origin + `/cluster/${cluster?.contextName}/no-permissions`;
        }
        return resourceRules;
      } catch (e) {
        return [];
      }
    }
    return [];
  },
});
