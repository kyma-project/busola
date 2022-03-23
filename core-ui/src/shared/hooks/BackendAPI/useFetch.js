import { checkForTokenExpiration } from 'shared/hooks/BackendAPI/checkForTokenExpiration';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { baseUrl, throwHttpError } from 'shared/hooks/BackendAPI/config';
import { useConfig } from 'shared/contexts/ConfigContext';

export const useFetch = () => {
  const { authData, cluster, config, ssoData } = useMicrofrontendContext();
  const { fromConfig } = useConfig();

  if (!authData) return () => {};

  return async ({ relativeUrl, abortController, init }) => {
    checkForTokenExpiration(authData?.token);
    checkForTokenExpiration(ssoData?.idToken, { reason: 'sso-expiration' });

    init = {
      ...init,
      headers: {
        ...(init?.headers || {}),
        ...createHeaders(authData, cluster.cluster, config.requiresCA, ssoData),
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
