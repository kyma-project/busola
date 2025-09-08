import { useGet } from 'shared/hooks/BackendAPI/useGet';

export function useGetGardenerProvider() {
  const gardenerShootCMUrl =
    '/api/v1/namespaces/kube-system/configmaps/shoot-info';
  const { data, error, loading } = useGet(gardenerShootCMUrl);

  if (error || loading) return null;
  return data?.data.provider;
}
