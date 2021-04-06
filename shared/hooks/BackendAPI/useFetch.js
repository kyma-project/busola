import { checkForTokenExpiration } from './checkForTokenExpiration';
import { createHeaders } from './createHeaders';
import { useMicrofrontendContext } from '../../contexts/MicrofrontendContext';
import { baseUrl, throwHttpError } from './config';
import { useConfig } from '../../contexts/ConfigContext';

export const useFetch = () => {
  const { idToken, cluster } = useMicrofrontendContext();
  const { fromConfig } = useConfig();

  return async (relativeUrl, init) => {
    checkForTokenExpiration(idToken);

    init = {
      ...init,
      headers: {
        ...(init?.headers || {}),
        ...createHeaders(idToken, cluster),
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
