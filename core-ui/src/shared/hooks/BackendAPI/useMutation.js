/* eslint-disable react-hooks/rules-of-hooks */
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';

const useMutation = (method, headers) => {
  return options => {
    const fetch = useFetch();

    return async (relativeUrl, data) => {
      try {
        const response = await fetch({
          relativeUrl,
          init: {
            method,
            headers: {
              Accept: 'application/json',
              ...headers,
            },
            body: JSON.stringify(data),
          },
        });

        if (typeof options?.refetch === 'function') options.refetch();
        return await response.json();
      } catch (e) {
        throw e;
      }
    };
  };
};

export const useUpdate = useMutation('PATCH', {
  'Content-Type': 'application/json-patch+json',
});
export const usePut = useMutation('PUT', {
  'Content-Type': 'application/json',
});
export const useDelete = useMutation('DELETE');
