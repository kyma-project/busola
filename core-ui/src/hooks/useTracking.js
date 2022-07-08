import { useEffect } from 'react';
import LuigiClient from '@luigi-project/client';
import { useLocation } from 'react-router-dom';

function sendTrackingRequest(body) {
  LuigiClient.sendCustomMessage({ id: 'busola.tracking', body });
}

export function usePageViewTracking() {
  const { pathname } = useLocation();

  useEffect(() => {
    let navigationPath;
    if (pathname.includes('/namespaces/')) {
      if (new RegExp('/namespaces/[a-z0-9-]+/?(details)?$').test(pathname)) {
        // namespace details
        navigationPath = 'namespaces';
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
      event: 'page_view',
      data: { path, viewType },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}

export function useSessionStartTracking() {
  useEffect(() => {
    sendTrackingRequest({
      event: 'session_start',
      data: { hostname: window.location.hostname },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
