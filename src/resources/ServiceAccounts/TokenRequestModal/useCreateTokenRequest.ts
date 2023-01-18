import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from 'shared/contexts/NotificationContext';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { useDownloadKubeconfigWithToken } from './../useDownloadKubeconfigWithToken';

const creaTokenRequestTemplate = () => {
  return {
    apiVersion: 'authentication.k8s.io/v1',
    kind: 'TokenRequest',
    spec: {
      expirationSeconds: 3600,
    },
  };
};

export const useCreateTokenRequest = (
  namespace: string,
  serviceAccountName: string,
) => {
  const { t } = useTranslation();
  const post = usePost();
  const [tokenRequest, setTokenRequest] = useState(creaTokenRequestTemplate());
  const downloadKubeconfig = useDownloadKubeconfigWithToken();
  const { notifySuccess: notifyToast } = useNotification();

  const createTokenRequestFn = useCallback(async () => {
    try {
      const response = await post(
        `/api/v1/namespaces/${namespace}/serviceaccounts/${serviceAccountName}/token`,
        tokenRequest,
      );
      downloadKubeconfig(serviceAccountName, response.status.token);
      notifyToast({
        content: t('service-accounts.token-request.notification-succes'),
      });
    } catch (error) {
      notifyToast({
        content: t('service-accounts.token-request.notification-failure'),
      });
    }
  }, [
    namespace,
    serviceAccountName,
    post,
    tokenRequest,
    downloadKubeconfig,
    t,
    notifyToast,
  ]);

  return {
    createTokenRequestFn,
    tokenRequest,
    setTokenRequest,
  };
};
