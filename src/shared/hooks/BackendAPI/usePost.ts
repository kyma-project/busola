import { FetchFn, useFetch } from 'shared/hooks/BackendAPI/useFetch';

export type PostFn = (
  url: string,
  data: Record<string, any>,
  options: Record<string, any>,
) => Promise<Record<string, any>>;

export const createPostFn: (fetch: FetchFn) => PostFn = fetch => async (
  url: string,
  data,
  options,
) => {
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
    if (typeof options?.refetch === 'function') options.refetch();
    return await response.json();
  } catch (e) {
    throw e;
  }
};

export const usePost = () => {
  const fetch = useFetch();
  return createPostFn(fetch as FetchFn);
};
