import { useRecoilState } from 'recoil';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { getResourceUrl } from 'resources/Namespaces/YamlUpload/helpers';

import { useUrl } from 'hooks/useUrl';

import { permittedUrlsState } from 'state/permittedUrlsAtom';
import { K8sResource } from 'types';

const DEFAULT_TIMEOUT = 3600;

export function usePermittedUrl(
  group: string,
  version: string,
  kind: string,
  resourceNamespace: string,
) {
  const { namespace } = useUrl();

  const url = getResourceUrl(
    {
      apiVersion: group ? `${group}/${version}` : version,
      kind,
    },
    null,
  );
  const namespacedUrl = getResourceUrl(
    {
      apiVersion: group ? `${group}/${version}` : version,
      kind,
    },
    resourceNamespace ? resourceNamespace : namespace,
  );

  const [permittedUrls, setPermittedUrls] = useRecoilState(permittedUrlsState);

  const now = new Date().getTime();
  const age =
    new Date(now).getTime() -
    new Date(permittedUrls?.[url]?.timestamp || 0).getTime();
  const skip = !permittedUrls?.[url] ? false : age < DEFAULT_TIMEOUT;

  const { error, loading } = useGetList()(url, {
    skip: skip || resourceNamespace,
    pollingInterval: 0,
    onDataReceived: () => {},
  }) as {
    loading: boolean;
    error: any;
    data: Array<K8sResource> | null;
  };

  const { error: namespacedError } = useGetList()(namespacedUrl, {
    skip: skip || error || loading || resourceNamespace,
    pollingInterval: 0,
    onDataReceived: () => {},
  }) as {
    loading: boolean;
    error: any;
    data: Array<K8sResource> | null;
  };

  if (loading) return null;
  if (resourceNamespace) return namespacedUrl;
  if (skip) {
    return permittedUrls?.[url].url;
  }

  const permittedUrl = error ? (namespacedError ? null : namespacedUrl) : url;
  setPermittedUrls({
    [url]: {
      url: permittedUrl,
      timestamp: new Date(),
    },
  });

  return permittedUrl;
}
