import { checkForTokenExpiration } from './checkForTokenExpiration';
import { createHeaders } from './createHeaders';
import { useMicrofrontendContext } from '../../contexts/MicrofrontendContext';
import { baseUrl, throwHttpError } from './config';
import { useConfig } from '../../contexts/ConfigContext';

export const useFetch = () => {
  const { authData, cluster } = useMicrofrontendContext();
  const { fromConfig } = useConfig();

  if (!authData) return () => {};

  return async (relativeUrl, init) => {
    checkForTokenExpiration(authData?.idToken);

    init = {
      ...init,
      headers: {
        ...(init?.headers || {}),
        ...createHeaders(authData, cluster),
      },
    };

    const response = await fetch(baseUrl(fromConfig) + relativeUrl, init);
    if (response.ok) {
      return response;
    } else {
      throw await throwHttpError(response);
    }
  };
};
