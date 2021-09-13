import React from 'react';
import { useMicrofrontendContext } from 'react-shared';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

export function useSentry() {
  const { features } = useMicrofrontendContext();
  const [dsn, setDsn] = React.useState();

  try {
    const feature = features?.SENTRY;
    if (feature && feature.isEnabled && feature.config?.dsn) {
      if (feature.config?.dsn !== dsn) {
        setDsn(feature.config?.dsn);
        Sentry.init({
          dsn: feature.config.dsn,
          release: 'busola',
          integrations: [new Integrations.BrowserTracing()],
          tracesSampleRate: 1.0,
        });
      }
    } else {
      console.log(feature);
    }
  } catch (e) {
    console.warn('Sentry not enabled due to error', e);
  }
}
