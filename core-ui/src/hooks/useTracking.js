import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { baseUrl } from 'shared/hooks/BackendAPI/config';
import { useConfig } from 'shared/contexts/ConfigContext';
import { useFeature } from 'shared/hooks/useFeature';

export function useTracking() {
  const { isEnabled } = useFeature('TRACKING');

  const { pathname } = useLocation();
  const { fromConfig } = useConfig();

  useEffect(() => {
    if (!isEnabled) return;

    let log;
    if (pathname.includes('/namespaces/')) {
      if (new RegExp('/namespaces/[a-z0-9-]+/?(details)?$').test(pathname)) {
        // namespace details
        log = 'namespaces';
      } else {
        // other resource details
        log = pathname.replace(new RegExp('/namespaces/.*?/'), '');
      }
    } else {
      // no namespace
      log = pathname.substring(1);
    }
    let tab = log.split('/'); // split by '/', take only first part
    if (tab.length > 1) {
      log = 'PATH:DETAILS ' + tab[0];
    } else {
      log = 'PATH:LIST ' + tab[0];
    }
    fetch(baseUrl(fromConfig) + '/tracking', {
      method: 'POST',
      body: log,
    }).catch(e => console.debug('Tracking call failed', e));
  }, [fromConfig, pathname, isEnabled]);
}
