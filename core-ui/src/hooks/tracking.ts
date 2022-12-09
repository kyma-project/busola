import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { useRecoilValue } from 'recoil';

import { useComponentDidMount } from 'shared/useComponentDidMount';
import { clusterState } from 'state/clusterAtom';

export function getLoggingId() {
  const STORAGE_KEY = 'busola.logging-id';

  let loggingId = localStorage.getItem(STORAGE_KEY);
  if (!loggingId) {
    loggingId = uuid();
    localStorage.setItem(STORAGE_KEY, loggingId ?? '');
  }
  return loggingId;
}

export async function sendTrackingRequest(body: any) {
  /* TODO tracking (this is code from 'core' - to be checked and potentially converted)
  if (process.env.IS_DOCKER) {
    return;
  }

  if ((await getCurrentConfig()).features.TRACKING.isEnabled) {
    body.metadata = { ...body.metadata, id: getLoggingId() };

    let additionalOptions = {};
    const ssoData = getSSOAuthData();
    if (ssoData?.idToken) {
      additionalOptions = {
        headers: {
          Authorization: `Bearer ${ssoData.idToken}`,
        },
      };
    }

    fetch(config.backendAddress + '/tracking', {
      method: 'POST',
      body: JSON.stringify(body),
      ...additionalOptions,
    }).catch(e => console.debug('Tracking call failed', e));
  }
  */
}

export function useAppTracking() {
  useSessionStartTracking();
  useClusterChangeTracking();
  usePageViewTracking();
}

function useSessionStartTracking() {
  const cluster = useRecoilValue(clusterState);

  useComponentDidMount(() => {
    sendTrackingRequest({
      event: 'SESSION_START',
      data: {
        apiServerAddress:
          cluster?.currentContext?.cluster?.cluster?.server || null,
      },
    });
  });
}

function usePageViewTracking() {
  const { pathname } = useLocation();

  useEffect(() => {
    let navigationPath;
    if (pathname.includes('/namespaces/')) {
      if (new RegExp('/namespaces/[a-z0-9-]+/?(details)?$').test(pathname)) {
        // namespace details
        navigationPath = 'namespaces/';
      } else {
        // other resource details
        navigationPath = pathname.replace(new RegExp('/namespaces/.*?/'), '');
      }
    } else {
      // no namespace
      navigationPath = pathname.substring(1);
    }
    const pathSegments = navigationPath.split('/'); // split by '/', take only first part
    let viewType = pathSegments.length > 1 ? 'DETAILS' : 'LIST';
    let path = pathSegments[0];

    if (pathname === '/overview') {
      path = 'clusters';
      viewType = 'DETAILS';
    }

    sendTrackingRequest({
      event: 'PAGE_VIEW',
      data: { path, viewType },
    });
  }, [pathname]);
}

function useClusterChangeTracking() {
  const cluster = useRecoilValue(clusterState);

  useEffect(() => {
    if (cluster?.currentContext?.cluster?.cluster?.server) {
      sendTrackingRequest({
        event: 'CLUSTER_CHANGE',
        data: {
          hostname: window.location.hostname,
          apiServerAddress: cluster?.currentContext?.cluster?.cluster?.server,
        },
      });
    }
  }, [cluster?.currentContext?.cluster?.cluster?.server]);
}
