import { useGet } from 'shared/hooks/BackendAPI/useGet';

export function useGetGardenerProvider({ skip }) {
  const gardenerShootCMUrl =
    '/api/v1/namespaces/kube-system/configmaps/shoot-info';
  const { data, error, loading } = useGet(gardenerShootCMUrl, {
    skip,
  });

  if (error || loading) return null;
  return data?.data.provider;
}
