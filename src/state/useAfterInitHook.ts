import { KubeconfigIdHandleState } from 'components/App/useLoginWithKubeconfigID';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useAtomValue } from 'jotai';
import { authDataAtom } from './authDataAtom';
import { clusterAtom } from './clusterAtom';
import { getIntendedPath, clearIntendedPath } from './intendedPathAtom';
import { ssoDataAtom, useIsSSOEnabled } from './ssoDataAtom';

const PREVIOUS_PATHNAME_KEY = 'busola.previous-pathname';

export function savePreviousPath(
  pathname: string = window.location.pathname,
  search: string = window.location.search,
) {
  const queryParams = new URLSearchParams(search);

  const layoutParam = queryParams.get('layout');
  const resourceNamespaceParam = queryParams.get('resourceNamespace');
  const showCreateParam = queryParams.get('showCreate');
  const createTypeParam = queryParams.get('createType');
  const showEditParam = queryParams.get('showEdit');
  const editColumnParam = queryParams.get('editColumn');

  let previousPath = pathname;

  if (
    layoutParam ||
    resourceNamespaceParam ||
    showCreateParam ||
    showEditParam
  ) {
    previousPath += '?';
    const params = [];

    if (layoutParam) params.push(`layout=${layoutParam}`);
    if (resourceNamespaceParam)
      params.push(`resourceNamespace=${resourceNamespaceParam}`);
    if (showCreateParam) params.push(`showCreate=${showCreateParam}`);
    if (createTypeParam) params.push(`createType=${createTypeParam}`);
    if (showEditParam) params.push(`showEdit=${showEditParam}`);
    if (editColumnParam) params.push(`editColumn=${editColumnParam}`);

    previousPath += params.join('&');
  }

  if (previousPath !== '/' && previousPath !== '/clusters') {
    localStorage.setItem(PREVIOUS_PATHNAME_KEY, previousPath);
  }
}

export function getPreviousPath() {
  return localStorage.getItem(PREVIOUS_PATHNAME_KEY);
}

export function removePreviousPath() {
  localStorage.removeItem(PREVIOUS_PATHNAME_KEY);
}

// Updates `busola.previous-pathname` on every in-app navigation so a later
// session-expiry redirect can return the user to their last page.
export function usePreviousPathTracker() {
  const location = useLocation();
  useEffect(() => {
    savePreviousPath(location.pathname, location.search);
  }, [location.pathname, location.search]);
}

export function useAfterInitHook(handledKubeconfigId: KubeconfigIdHandleState) {
  const cluster = useAtomValue(clusterAtom);
  const authData = useAtomValue(authDataAtom);
  const ssoData = useAtomValue(ssoDataAtom);
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const initDone = useRef(false);
  const isSSOEnabled = useIsSSOEnabled();

  useEffect(() => {
    if (initDone.current === true) {
      return;
    }
    // wait until kubeconfig id is finished
    if (handledKubeconfigId !== 'done') {
      return;
    }

    if (isSSOEnabled && !ssoData) {
      return;
    }

    // wait until gardener login is done
    if (window.location.pathname === '/gardener-login') {
      return;
    }

    // cluster not yet loaded
    if (cluster === undefined) {
      return;
    }

    // cluster is here (!== null), but authData is not loaded yet
    if (!!cluster && !authData) {
      return;
    }

    initDone.current = true;

    const intendedPath = getIntendedPath();
    if (intendedPath?.path && cluster) {
      const fullPath = `/cluster/${encodeURIComponent(cluster.name)}${intendedPath.path}`;
      navigate(fullPath);
      clearIntendedPath();
      return;
    }

    // Only restore when we've landed on '/'. The user is on any other URL
    // deliberately, so don't hijack them.
    const hasEmptyPath = window.location.pathname === '/';
    if (!hasEmptyPath) return;

    const previousPath = getPreviousPath();
    if (
      previousPath &&
      previousPath.startsWith('/') &&
      !previousPath.startsWith('//')
    ) {
      navigate(previousPath);
      removePreviousPath();
    } else if (cluster) {
      navigate(`/cluster/${encodeURIComponent(cluster.name)}/overview`);
    } else {
      navigate('/clusters');
    }
  }, [
    cluster,
    authData,
    search,
    navigate,
    handledKubeconfigId,
    ssoData,
    isSSOEnabled,
  ]);
}
