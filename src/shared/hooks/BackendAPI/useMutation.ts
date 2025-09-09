/* eslint-disable react-hooks/rules-of-hooks */
import { FetchFn, useFetch } from 'shared/hooks/BackendAPI/useFetch';

export type MutationFn = (
  url: string,
  data: Record<string, any>,
) => Promise<Record<string, any>>;

const useMutation = (
  method: string,
  fetch: FetchFn,
  options?: Record<string, any>,
  headers?: any,
): MutationFn => {
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

export const useUpdate = (options?: Record<string, any>): MutationFn => {
  const fetch = useFetch();
  return useMutation('PATCH', fetch, options, {
    'Content-Type': 'application/json-patch+json',
  });
};

export const useDelete = (options: Record<string, any>): MutationFn => {
  const fetch = useFetch();
  return useMutation('DELETE', fetch, options);
};
