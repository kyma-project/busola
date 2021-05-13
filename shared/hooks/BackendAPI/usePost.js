import { useFetch } from './useFetch';

export const usePost = () => {
  const fetch = useFetch();
  return async (url, data, options) => {
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
};
