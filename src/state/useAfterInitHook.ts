import { KubeconfigIdHandleState } from 'components/App/useLoginWithKubeconfigID';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authDataState } from './authDataAtom';
import { clusterState } from './clusterAtom';

const PREVIOUS_PATHNAME_KEY = 'busola.previous-pathname';

export function savePreviousPath() {
  const queryParams = new URLSearchParams(window.location.search);

  const previousPath = queryParams.get('layout')
    ? `${window.location.pathname}?layout=${queryParams.get('layout')}`
    : window.location.pathname;
  console.log(previousPath);
  if (previousPath !== '/' && previousPath !== '/clusters') {
    console.log('SAVE PATH');
    localStorage.setItem(PREVIOUS_PATHNAME_KEY, previousPath);
  }
}

export function getPreviousPath() {
  return localStorage.getItem(PREVIOUS_PATHNAME_KEY);
}

export function removePreviousPath() {
  console.log('REMOVE!!!!!');
  localStorage.removeItem(PREVIOUS_PATHNAME_KEY);
}

export function useAfterInitHook(handledKubeconfigId: KubeconfigIdHandleState) {
  const cluster = useRecoilValue(clusterState);
  const authData = useRecoilValue(authDataState);
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const initDone = useRef(false);
  console.log(cluster);
  console.log(initDone.current);
  console.log(!!cluster && !authData);
  console.log(handledKubeconfigId);
  useEffect(() => {
    console.log(search.get('kubeconfigID'));
    console.log(window.location.pathname);

    if (initDone.current === true) {
      return;
    }
    // wait until kubeconfig id is finished
    if (handledKubeconfigId !== 'done') {
      console.log('WAITING');
      return;
    }

    // wait until gardener login is done
    if (window.location.pathname === '/gardener-login') {
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

    console.log(cluster);
    initDone.current = true;
    const previousPath = getPreviousPath();
    console.log(previousPath);
    if (previousPath) {
      console.log('NAVIGATE!!!!');
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
