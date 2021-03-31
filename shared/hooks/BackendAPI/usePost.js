import { baseUrl, throwHttpError } from './config';
import { useMicrofrontendContext } from '../../contexts/MicrofrontendContext';
import { createHeaders } from './createHeaders';
import { useConfig } from '../../contexts/ConfigContext';

export const usePost = () => {
  const { token, cluster } = useMicrofrontendContext();
  const { fromConfig } = useConfig();
  return async (url, data, options) => {
    const response = await fetch(baseUrl(fromConfig) + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...createHeaders(token, cluster),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw await throwHttpError(response);
    if (typeof options?.refetch === 'function') options.refetch();
    return await response.json();
  };
};
