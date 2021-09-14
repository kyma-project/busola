import React from 'react';
import { useMicrofrontendContext } from 'react-shared';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

export function useSentry() {
  const { features } = useMicrofrontendContext();
  const [dsn, setDsn] = React.useState();

  const initSentry = dsn => {
    Sentry.init({
      dsn,
      release: 'busola',
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 1.0,
      debug: true,
      beforeSend: (e, hint) => {
        console.log(e, hint);
        return e;
      },
    });
  };

  try {
    const feature = features?.SENTRY || {};
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
