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

export function useTracking() {
  const { isEnabled } = useFeature('TRACKING');

  const { pathname } = useLocation();
  const { fromConfig } = useConfig();

  useEffect(() => {
    if (!isEnabled) return;

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
    let log;
    if (pathSegments.length > 1) {
      log = 'DETAILS ' + pathSegments[0];
    } else {
      log = 'LIST ' + pathSegments[0];
    }
    fetch(baseUrl(fromConfig) + '/tracking', {
      method: 'POST',
      body: JSON.stringify({ type: 'PATH', payload: log, id: getLoggingId() }),
    }).catch(e => console.debug('Tracking call failed', e));
  }, [fromConfig, pathname, isEnabled]);
}
