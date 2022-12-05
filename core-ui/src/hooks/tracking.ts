import { useEffect } from 'react';
import LuigiClient from '@luigi-project/client';
import { useLocation } from 'react-router-dom';
import { useComponentDidMount } from 'shared/useComponentDidMount';
import { useRecoilValue } from 'recoil';
import { clusterState } from 'state/clusterAtom';

function sendTrackingRequest(body: any) {
  LuigiClient.sendCustomMessage({ id: 'busola.tracking', body });
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
