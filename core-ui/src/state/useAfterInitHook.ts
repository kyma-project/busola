import { KubeconfigIdHandleState } from 'components/App/useLoginWithKubeconfigID';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authDataState } from './authDataAtom';
import { clusterState } from './clusterAtom';

const PREVIOUS_PATHNAME_KEY = 'busola.previous-pathname';

export function savePreviousPath() {
  const previousPath = window.location.pathname;
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

    // cluster not yet loaded
    if (!cluster === undefined) {
      return;
    }

    // cluster is here (!== null), but authData is not loaded yet
    if (!!cluster && !authData) {
      return;
    }

    initDone.current = true;
    const previousPath = getPreviousPath();
    if (previousPath) {
      navigate(previousPath);
      removePreviousPath();
    } else {
      const hasEmptyPath = window.location.pathname === '/';
      if (hasEmptyPath) {
        if (cluster) {
          navigate(`/cluster/${cluster.name}/overview`);
        } else {
          navigate('/clusters');
        }
      }
    }
  }, [cluster, authData, search, navigate, handledKubeconfigId]);
}
