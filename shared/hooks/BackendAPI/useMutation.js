import { useFetch } from './useFetch';

const useMutation = method => {
  return options => {
    const fetch = useFetch();

    return async (relativeUrl, data) => {
      try {
        const response = await fetch({
          relativeUrl,
          init: {
            method,
            headers: {
              'Content-Type': 'application/json-patch+json',
              Accept: 'application/json',
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

export const useUpdate = useMutation('PATCH');
export const useDelete = useMutation('DELETE');
