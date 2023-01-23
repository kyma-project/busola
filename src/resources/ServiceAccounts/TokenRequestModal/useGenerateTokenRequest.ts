import { useTranslation } from 'react-i18next';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useCreateKubeconfig } from 'hooks/useCreateKubeconfig';
import { useState, useEffect, useMemo } from 'react';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import jsyaml from 'js-yaml';

const createTokenRequestTemplate = () => {
  return {
    apiVersion: 'authentication.k8s.io/v1',
    kind: 'TokenRequest',
    spec: {
      expirationSeconds: 3600,
    },
  };
};

export const useGenerateTokenRequest = (
  namespace: string,
  serviceAccountName: string,
) => {
  const { t } = useTranslation();
  const post = usePost();
  const [tokenRequest, setTokenRequest] = useState(
    createTokenRequestTemplate(),
  );
  const [token, setToken] = useState<string>('');
  const createKubeconfig = useCreateKubeconfig();
  const { notifySuccess: notifyToast } = useNotification();

  const kubeconfigYaml = useMemo(() => {
    return jsyaml.dump(createKubeconfig(`${serviceAccountName}-token`, token));
  }, [createKubeconfig, serviceAccountName, token]);

  const generateTokenRequest = async () => {
    try {
      const response = await post(
        `/api/v1/namespaces/${namespace}/serviceaccounts/${serviceAccountName}/token`,
        tokenRequest,
      );
      setToken(response.status.token);
      notifyToast(
        {
          content: t('service-accounts.token-request.notification.success'),
        },
        3000,
      );
    } catch (error) {
      notifyToast({
        content: t('service-accounts.token-request.notification.failure'),
      });
    }
  };
  useEffect(() => {
    generateTokenRequest();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    kubeconfigYaml,
    token,
    generateTokenRequest,
    tokenRequest,
    setTokenRequest,
  };
};
