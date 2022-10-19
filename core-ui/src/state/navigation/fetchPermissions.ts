import { GetRecoilValue } from 'recoil';
import { activeNamespaceIdState } from '../activeNamespaceIdAtom';
import { getPostFn } from '../utils/getPostFn';

export type PermissionSet = {
  verbs: string[];
  apiGroups: string[];
  resources: string[];
};

export const fetchPermissions = async (
  get: GetRecoilValue,
): Promise<PermissionSet[] | null> => {
  const activeNamespaceId = get(activeNamespaceIdState);
  const postFn = getPostFn(get);

  if (postFn) {
    const namespaceName = activeNamespaceId ? activeNamespaceId : '*';
    const path = '/apis/authorization.k8s.io/v1/selfsubjectrulesreviews';
    const ssrr = {
      typeMeta: {
        kind: 'SelfSubjectRulesReview',
        aPIVersion: 'authorization.k8s.io/v1',
      },
      spec: { namespace: namespaceName },
    };

    const permissions = await postFn(path, ssrr, {});

    return permissions.status.resourceRules;
  }
  return null;
};
