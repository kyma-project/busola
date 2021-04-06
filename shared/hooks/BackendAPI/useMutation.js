import { baseUrl, throwHttpError } from './config';
import { useMicrofrontendContext } from '../../contexts/MicrofrontendContext';
import { createHeaders } from './createHeaders';
import { useConfig } from '../../contexts/ConfigContext';
import { checkForTokenExpiration } from './tokenExpirationGuard';

const useMutation = method => {
  return options => {
    const { idToken, cluster } = useMicrofrontendContext();
    const { fromConfig } = useConfig();
    return async (url, data) => {
      checkForTokenExpiration(idToken);
      const response = await fetch(baseUrl(fromConfig) + url, {
        method,
        headers: {
          'Content-Type': 'application/json-patch+json',
          Accept: 'application/json',
          ...createHeaders(idToken, cluster),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw await throwHttpError(response);

      if (typeof options?.refetch === 'function') options.refetch();
      return await response.json();
    };
  };
};

export const useUpdate = useMutation('PATCH');
export const useDelete = useMutation('DELETE');
