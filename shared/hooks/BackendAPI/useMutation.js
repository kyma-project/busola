import { useFetch } from './useFetch';
import { useRecorder } from '../../contexts/ReplayContext/ReplayContext';

const useMutation = method => {
  return options => {
    const fetch = useFetch();
    const { register } = useRecorder();

    return async (relativeUrl, data) => {
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
      const result = await response.json();
      register({ method, result });
      return result;
    };
  };
};

export const useUpdate = useMutation('PATCH');
export const useDelete = useMutation('DELETE');
