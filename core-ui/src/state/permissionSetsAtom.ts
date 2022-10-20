import { RecoilValue, selector } from 'recoil';
import { activeNamespaceIdState } from './activeNamespaceIdAtom';
import { getPostFn } from './utils/getPostFn';

export type PermissionSet = {
  verbs: string[];
  apiGroups: string[];
  resources: string[];
};

export type PermissionSetState = PermissionSet[];

export const permissionSetsAtom: RecoilValue<PermissionSetState> = selector<
  PermissionSetState
>({
  key: 'PermissionSet',
  get: async ({ get }) => {
    const activeNamespaceId = get(activeNamespaceIdState);
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

      const permissions = await postFn(path, ssrr, {});

      return permissions.status.resourceRules;
    }
  },
});
