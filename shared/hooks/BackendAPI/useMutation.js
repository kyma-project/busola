import { baseUrl, throwHttpError } from './config';
import { useMicrofrontendContext } from '../../contexts/MicrofrontendContext';
import { useConfig } from '../../contexts/ConfigContext';

const useMutation = method => {
  return options => {
    const { idToken, k8sApiUrl } = useMicrofrontendContext();
    const { fromConfig } = useConfig();
    return async (url, data) => {
      const response = await fetch(baseUrl(fromConfig) + url, {
        method,
        headers: {
          'Content-Type': 'application/json-patch+json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + idToken,
          'X-Api-Url': k8sApiUrl,
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
