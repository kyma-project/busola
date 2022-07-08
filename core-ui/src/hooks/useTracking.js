import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { baseUrl } from 'shared/hooks/BackendAPI/config';
import { useConfig } from 'shared/contexts/ConfigContext';
import { useFeature } from 'shared/hooks/useFeature';
import { v4 as uuid } from 'uuid';

function getLoggingId() {
  const STORAGE_KEY = 'busola.logging-id';

  let loggingId = localStorage.getItem(STORAGE_KEY);
  if (!loggingId) {
    loggingId = uuid();
    localStorage.setItem(STORAGE_KEY, loggingId);
  }
  return loggingId;
}

function useTracking() {
  const { isEnabled } = useFeature('TRACKING');
  const { fromConfig } = useConfig();

  return {
    track(body) {
      if (!isEnabled) return;

      fetch(baseUrl(fromConfig) + '/tracking', {
        method: 'POST',
        body: JSON.stringify(body),
      }).catch(e => console.debug('Tracking call failed', e));
    },
  };
}

export function usePageViewTracking() {
  const { pathname } = useLocation();
  const { track } = useTracking();

  useEffect(() => {
    let path;
    if (pathname.includes('/namespaces/')) {
      if (new RegExp('/namespaces/[a-z0-9-]+/?(details)?$').test(pathname)) {
        // namespace details
        path = 'namespaces';
      } else {
        // other resource details
        path = pathname.replace(new RegExp('/namespaces/.*?/'), '');
      }
    } else {
      // no namespace
      path = pathname.substring(1);
    }
    const pathSegments = path.split('/'); // split by '/', take only first part
    const viewType = pathSegments.length > 1 ? 'DETAILS' : 'LIST';

    const body = {
      event: 'page_view',
      data: { path: pathSegments[0], viewType },
      metadata: { id: getLoggingId() },
    };
    track(body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}

export function useSessionStartTracking() {
  const { track } = useTracking();

  useEffect(() => {
    track({
      event: 'session_start',
      data: { hostname: window.location.hostname },
      metadata: { id: getLoggingId() },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
