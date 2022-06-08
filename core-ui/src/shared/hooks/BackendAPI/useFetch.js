import { checkForTokenExpiration } from 'shared/hooks/BackendAPI/checkForTokenExpiration';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { baseUrl, throwHttpError } from 'shared/hooks/BackendAPI/config';
import { useConfig } from 'shared/contexts/ConfigContext';
import { useAuth } from 'store/clusters/AuthContext';
import { useClusters } from 'store/clusters/useClusters';

export const useFetch = () => {
  const { ssoData } = useMicrofrontendContext();
  const authData = useAuth();
  const { currentCluster } = useClusters();
  const { fromConfig } = useConfig();
  var config = { requiresCA: true };

  if (!authData) return () => {};

  return async ({ relativeUrl, abortController, init }) => {
    checkForTokenExpiration(authData?.token);
    checkForTokenExpiration(ssoData?.idToken, { reason: 'sso-expiration' });

    init = {
      ...init,
      headers: {
        ...(init?.headers || {}),
        ...createHeaders(authData, currentCluster, config.requiresCA, ssoData),
      },
      signal: abortController?.signal,
    };

    try {
      const response = await fetch(baseUrl(fromConfig) + relativeUrl, init);
      if (response.ok) {
        return response;
      } else {
        throw await throwHttpError(response);
      }
    } catch (e) {
      console.error('Fetch failed: ', e);
      throw e;
    }
  };
};
