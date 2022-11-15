import { useTranslation } from 'react-i18next';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { getErrorMessage } from 'shared/utils/helpers';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export function useGetVersions() {
  const { t } = useTranslation();
  const { features } = useMicrofrontendContext();
  const showKymaVersion = features?.SHOW_KYMA_VERSION?.isEnabled;

  const {
    data: k8sVersion,
    error: k8sVersionError,
    loading: k8sVersionLoading,
  } = useGet('/version');

  const { data: kymaNamespace, loading: kymaNamespaceLoading } = useGet(
    '/api/v1/namespaces/kyma-system',
    {
      skip: !showKymaVersion,
    },
  );

  if (k8sVersionLoading || kymaNamespaceLoading)
    return { loading: t('common.headers.loading') };

  const formatClusterVersion = () => {
    if (k8sVersionError) return getErrorMessage(k8sVersionError);
    return k8sVersion?.gitVersion;
  };

  const kymaVersion =
    kymaNamespace?.metadata.labels?.[
      'reconciler.kyma-project.io/origin-version'
    ];
  return { kymaVersion, k8sVersion: formatClusterVersion(), loading: false };
}
