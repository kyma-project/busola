import { useEffect } from 'react';
import LuigiClient from '@luigi-project/client';
import { useLocation } from 'react-router-dom';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useComponentDidMount } from 'shared/useComponentDidMount';

function sendTrackingRequest(body) {
  LuigiClient.sendCustomMessage({ id: 'busola.tracking', body });
}

export function useAppTracking() {
  useSessionStartTracking();
  useClusterChangeTracking();
  usePageViewTracking();
}

function useSessionStartTracking() {
  const { cluster } = useMicrofrontendContext();
  useComponentDidMount(() => {
    sendTrackingRequest({
      event: 'SESSION_START',
      data: { apiServerAddress: cluster?.cluster.server || null },
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
  const { cluster } = useMicrofrontendContext();

  useEffect(() => {
    if (cluster?.cluster.server) {
      sendTrackingRequest({
        event: 'CLUSTER_CHANGE',
        data: {
          hostname: window.location.hostname,
          apiServerAddress: cluster.cluster.server,
        },
      });
    }
  }, [cluster?.cluster.server]);
}
