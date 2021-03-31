import { baseUrl, throwHttpError } from './config';
import { useMicrofrontendContext } from '../../contexts/MicrofrontendContext';
import { createHeaders } from './createHeaders';
import { useConfig } from '../../contexts/ConfigContext';

const useMutation = method => {
  return options => {
    const { authData, cluster } = useMicrofrontendContext();
    const { fromConfig } = useConfig();
    return async (url, data) => {
      const response = await fetch(baseUrl(fromConfig) + url, {
        method,
        headers: {
          'Content-Type': 'application/json-patch+json',
          Accept: 'application/json',
          ...createHeaders(authData, cluster),
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
