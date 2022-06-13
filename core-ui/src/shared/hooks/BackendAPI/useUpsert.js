import { usePost } from './usePost';
import { useUpdate } from './useMutation';
import { useFetch } from './useFetch';
import { createPatch } from 'rfc6902';

export function useUpsert() {
  const postRequest = usePost();
  const patchRequest = useUpdate();
  const fetch = useFetch();

  const getExistingResource = async (url, name) => {
    try {
      return await fetch({ relativeUrl: url + '/' + name });
    } catch (e) {
      console.debug(e);
      return null;
    }
  };

  return async ({ url, resource, onSuccess, onError }) => {
    const name = resource.metadata.name;
    const existingResource = await getExistingResource(url, name);
    try {
      if (existingResource) {
        await patchRequest(
          url + '/' + name,
          createPatch(existingResource, resource),
        );
      } else {
        await postRequest(url, resource);
      }
      onSuccess();
    } catch (e) {
      onError(e);
    }
  };
}
