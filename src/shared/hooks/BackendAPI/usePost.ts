import { FetchFn, useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { HttpError } from 'shared/hooks/BackendAPI/config';

export type PostFn = (
  url: string,
  data: Record<string, any>,
  options?: Record<string, any>,
) => Promise<Record<string, any>>;

export const createPostFn: (fetch: FetchFn) => PostFn =
  (fetch) => async (url: string, data, options) => {
    try {
      const response = await fetch({
        relativeUrl: url,
        init: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(data),
        },
      });
      if (!response.ok) {
        console.log('response not ok');
      }
      if (typeof options?.refetch === 'function') options.refetch();
      const x = await response.json();
      return x;
    } catch (e) {
      if (e instanceof HttpError) {
        const jsonError = e.message; // must await for response
        console.log('---------', jsonError);
      }
      throw e;
    }
  };

export const usePost = () => {
  const fetch = useFetch();
  return createPostFn(fetch as FetchFn);
};
