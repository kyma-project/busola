import { useGet, useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';

export const useFetchExtensions = () => {
  // const fetch = useSingleGet();
  const fetch = useFetch();

  return async () => {
    //TODO fetch built in EXT from /assets/extensions/extensions.yaml

    const res = await window
      .fetch('http://localhost:8080/assets/extensions/extensions.yaml')
      .then(res => res.text());

    // load busola cluster CRs
    // load target cluster CRs
  };
};
