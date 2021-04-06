import { useFetch } from './useFetch';

export const usePost = () => {
  const fetch = useFetch();
  return async (url, data, options) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (typeof options?.refetch === 'function') options.refetch();
    return await response.json();
  };
};
