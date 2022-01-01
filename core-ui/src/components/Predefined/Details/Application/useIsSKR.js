import { useGet } from 'react-shared';

export function useIsSKR() {
  const { data: configmap } = useGet(
    '/api/v1/namespaces/kyma-system/configmaps/skr-configmap',
  );

  return configmap?.data?.['is-managed-kyma-runtime'] === 'true';
}
