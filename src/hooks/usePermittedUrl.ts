import { useRecoilState } from 'recoil';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useUrl } from 'hooks/useUrl';

import { permittedUrlsState } from 'state/permittedUrlsAtom';
import { K8sResource } from 'types';

const DEFAULT_TIMEOUT = 3600;
export function usePermittedUrl(
  group: string,
  version: string,
  resourceType: string,
) {
  const { namespace } = useUrl();

  const groupPrefix = group ? `apis/${group}` : 'api';
  const url = `/${groupPrefix}/${version}/${resourceType}`;
  const namespacedUrl = `/${groupPrefix}/${version}/namespaces/${namespace}/${resourceType}`;

  const [permittedUrls, setPermittedUrls] = useRecoilState(permittedUrlsState);

  const now = new Date().getTime();
  const age =
    new Date(now).getTime() -
    new Date(permittedUrls?.[url]?.timestamp || 0).getTime();
  const skip = !permittedUrls?.[url] ? false : age < DEFAULT_TIMEOUT;

  const { error, loading } = useGetList()(url, {
    skip: skip,
    pollingInterval: 0,
    onDataReceived: () => {},
  }) as {
    loading: boolean;
    error: any;
    data: Array<K8sResource> | null;
  };

  const { error: namespacedError } = useGetList()(namespacedUrl, {
    skip: skip && !error && !loading,
    pollingInterval: 0,
    onDataReceived: () => {},
  }) as {
    loading: boolean;
    error: any;
    data: Array<K8sResource> | null;
  };

  if (loading) return null;
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
