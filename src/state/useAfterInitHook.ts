import { KubeconfigIdHandleState } from 'components/App/useLoginWithKubeconfigID';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authDataState } from './authDataAtom';
import { clusterState } from './clusterAtom';
import { getSSOAuthToken, ssoDataState, getIsSSOEnabled } from './ssoDataAtom';

const PREVIOUS_PATHNAME_KEY = 'busola.previous-pathname';

export function savePreviousPath() {
  const queryParams = new URLSearchParams(window.location.search);

  const previousPath = queryParams.get('layout')
    ? `${window.location.pathname}?layout=${queryParams.get('layout')}`
    : window.location.pathname;
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
  const ssoData = useRecoilValue(ssoDataState);
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const initDone = useRef(false);
  const isSSOEnabled = getIsSSOEnabled();

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
  }, [cluster, authData, search, navigate, handledKubeconfigId, ssoData]);
}
