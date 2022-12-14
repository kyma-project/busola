import React from 'react';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { useFeature } from './useFeature';

export function useSentry() {
  const [dsn, setDsn] = React.useState();

  const initSentry = dsn => {
    Sentry.init({
      dsn,
      release: 'busola',
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 1.0,
    });
  };

  try {
    const feature = useFeature('SENTRY') || {};
    if (feature.isEnabled && feature.config?.dsn) {
      const nextDsn = feature.config.dsn;

      if (nextDsn !== dsn) {
        setDsn(nextDsn);
        initSentry(nextDsn);
      }
    }
  } catch (e) {
    console.warn('Sentry not enabled due to error', e);
  }
}
