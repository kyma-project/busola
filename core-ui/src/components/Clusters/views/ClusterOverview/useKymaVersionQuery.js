import { useTranslation } from 'react-i18next';
import { useGet } from 'react-shared';

export function useKymaVersionQuery({ skip }) {
  const { t } = useTranslation();

  const { data, error, loading } = useGet('/api/v1/namespaces/kyma-system', {
    skip,
  });

  if (loading) {
    return t('common.headers.loading');
  } else if (error) {
    console.warn(error);
    return t('clusters.statuses.unknown');
  } else {
    return (
      data?.metadata.labels?.['reconciler.kyma-project.io/origin-version'] ||
      t('clusters.statuses.unknown')
    );
  }
}
