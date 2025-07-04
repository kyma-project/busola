import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { useFeature } from './useFeature';

const initSentry = dsn => {
  try {
    Sentry.init({
      dsn,
      release: 'busola',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  } catch (e) {
    console.warn('Sentry not enabled due to error', e);
  }
};

export function useSentry() {
  const [dsn, setDsn] = useState(null);
  const feature = useFeature('SENTRY');

  useEffect(() => {
    try {
      if (feature?.isEnabled && feature?.config?.dsn) {
        const nextDsn = feature.config.dsn;
        if (nextDsn !== dsn) {
          setDsn(nextDsn);
          initSentry(nextDsn);
        }
      }
    } catch (e) {
      console.warn('Sentry not enabled due to error', e);
    }
  }, [feature, dsn]);
}
