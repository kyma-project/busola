import { usePost } from 'shared/hooks/BackendAPI/usePost';

export const useFetchPermissions = () => {
  const postRequest = usePost();
  const path = '/apis/authorization.k8s.io/v1/selfsubjectrulesreviews';

  return async ({ namespace = '*' }) => {
    const ssrr = {
      typeMeta: {
        kind: 'SelfSubjectRulesReview',
        aPIVersion: 'authorization.k8s.io/v1',
      },
      spec: { namespace },
    };

    return postRequest(path, ssrr, {}).then(res => {
      return res.status.resourceRules;
    });
  };
};
