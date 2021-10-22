import { useRecorder } from '../../contexts/ReplayContext/ReplayContext';
import { useFetch } from './useFetch';

export const usePost = () => {
  const fetch = useFetch();
  const { register } = useRecorder();

  return async (url, data, options) => {
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
    const result = await response.json();
    register({ method: 'POST', result });
    return result;
  };
};
