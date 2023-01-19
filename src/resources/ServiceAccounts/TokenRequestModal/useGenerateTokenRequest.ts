import { useState } from 'react';
import { usePost } from 'shared/hooks/BackendAPI/usePost';

const creaTokenRequestTemplate = () => {
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
  const post = usePost();
  const [tokenRequest, setTokenRequest] = useState(creaTokenRequestTemplate());
  const [token, setToken] = useState<string>('');

  const generateTokenRequest = async () => {
    try {
      const response = await post(
        `/api/v1/namespaces/${namespace}/serviceaccounts/${serviceAccountName}/token`,
        tokenRequest,
      );

      setToken(response.status.token);
    } catch (error) {}
  };

  return {
    token,
    generateTokenRequest,
    tokenRequest,
    setTokenRequest,
  };
};
