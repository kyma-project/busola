import { KubeconfigIdHandleState } from 'components/App/useLoginWithKubeconfigID';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useRecoilValue } from 'recoil';
import { authDataState } from './authDataAtom';
import { clusterState } from './clusterAtom';

const PREVIOUS_PATHNAME_KEY = 'busola.previous-pathname';

export function savePreviousPath() {
  const queryParams = new URLSearchParams(window.location.search);

  const layoutParam = queryParams.get('layout');
  const resourceNamespaceParam = queryParams.get('resourceNamespace');
  const showCreateParam = queryParams.get('showCreate');
  const showEditParam = queryParams.get('showEdit');
  const editColumnParam = queryParams.get('editColumn');

  let previousPath = window.location.pathname;

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

export function useAfterInitHook(handledKubeconfigId: KubeconfigIdHandleState) {
  const cluster = useRecoilValue(clusterState);
  const authData = useRecoilValue(authDataState);
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current === true) {
      return;
    }
    // wait until kubeconfig id is finished
    if (handledKubeconfigId !== 'done') {
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
    const previousPath = getPreviousPath();

    if (
      previousPath &&
      previousPath.startsWith('/') &&
      !previousPath.startsWith('//')
    ) {
      navigate(previousPath);
      removePreviousPath();
    } else {
      const hasEmptyPath = window.location.pathname === '/';
      if (hasEmptyPath) {
        if (cluster) {
          navigate(`/cluster/${encodeURIComponent(cluster.name)}/overview`);
        } else {
          navigate('/clusters');
        }
      }
    }
  }, [cluster, authData, search, navigate, handledKubeconfigId]);
}
