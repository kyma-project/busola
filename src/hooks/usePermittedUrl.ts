import { useEffect } from 'react';
import { useMatch } from 'react-router';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useGetHiddenNamespaces } from 'shared/hooks/useGetHiddenNamespaces';
import { permittedUrlsState } from 'state/permittedUrlsAtom';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { K8sResource } from 'types';

export function usePermittedUrl(url: string, fallbackUrl: string) {
  // const showHiddenNamespaces = useRecoilValue(showHiddenNamespacesState);
  // const hiddenNamespaces = useGetHiddenNamespaces();
  const [permittedUrls, setPermittedUrls] = useRecoilState(permittedUrlsState);
  console.log('lololololo', permittedUrls);
  console.log(
    'lololololo permittedUrls?.[url]',
    permittedUrls?.[url] ? permittedUrls[url] : 's',
  );
  const namespace =
    useMatch({ path: '/cluster/:cluster/namespaces/:namespace', end: false })
      ?.params?.namespace ?? '';
  const now = new Date().getTime();
  // console.log('lolo timestamp', permittedUrls?.[url].timestamp, now, new Date(now).getTime() - new Date(permittedUrls?.[url].timestamp || 0).getTime() > 3000)
  console.log(
    'lolo timestamp1',
    !permittedUrls?.[url],
    permittedUrls?.[url] ? permittedUrls?.[url].timestamp : '',
  );
  const skip = !permittedUrls?.[url]
    ? false
    : new Date(now).getTime() -
        new Date(permittedUrls?.[url]?.timestamp || 0).getTime() >
      3000;
  console.log('lolo skip', skip);

  const { data, loading, error } = useGetList()(url, {
    skip: skip,
    pollingInterval: 0,
    onDataReceived: () => {},
  }) as {
    loading: boolean;
    error: any;
    data: Array<K8sResource> | null;
  };
  console.log('permittedUrls0', permittedUrls, error);

  const { error: namespacedError } = useGetList()(fallbackUrl, {
    skip: skip && !error,
    pollingInterval: 0,
    onDataReceived: () => {},
  }) as {
    loading: boolean;
    error: any;
    data: Array<K8sResource> | null;
  };
  if (skip) {
    console.log('exist url', url);
    return permittedUrls?.[url].url;
  }

  const permittedUrl = error ? (namespacedError ? null : fallbackUrl) : url;
  console.log('permittedUrls0', permittedUrls, error);
  setPermittedUrls({
    [url]: {
      url: permittedUrl,
      timestamp: new Date(),
    },
  });
  console.log('permittedUrls1', permittedUrls);

  return permittedUrl;
}
