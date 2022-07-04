import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

import { getBusolaClusterParams } from '../busola-cluster-params';

export async function initSentry() {
  const features = (await getBusolaClusterParams()).config?.features || {};
  const sentryFeature = features.SENTRY;

  // sentry is out of features flow, just check if it's enabled
  if (sentryFeature.isEnabled && sentryFeature.config?.dsn) {
    Sentry.init({
      dsn: sentryFeature.config.dsn,

      release: 'busola', //todo
      integrations: [new Integrations.BrowserTracing()],

      tracesSampleRate: 1.0,
    });
  }
}
