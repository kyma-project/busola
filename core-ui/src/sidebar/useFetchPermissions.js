import { usePost } from 'shared/hooks/BackendAPI/usePost';

export const useFetchPermissions = (namespace = '*') => {
  const postRequest = usePost();
  const path = '/apis/authorization.k8s.io/v1/selfsubjectrulesreviews';
  const ssrr = {
    typeMeta: {
      kind: 'SelfSubjectRulesReview',
      aPIVersion: 'authorization.k8s.io/v1',
    },
    spec: { namespace },
  };

  return async () =>
    postRequest(path, ssrr, {}).then(res => {
      return res;
    });
};
