import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

import { getBusolaClusterParams } from '../busola-cluster-params';
import { resolveFeatureAvailability } from '../features';

export async function initSentry() {
  const features = (await getBusolaClusterParams()).config?.features || {};
  const sentryFeature = features.SENTRY;
  const isSentryEnabled = await resolveFeatureAvailability(sentryFeature, null);

  console.log('core sentry', isSentryEnabled, sentryFeature.config.dsn);
  if (isSentryEnabled && sentryFeature.config.dsn) {
    Sentry.init({
      dsn: sentryFeature.config.dsn,

      release: 'busola', //todo
      integrations: [new Integrations.BrowserTracing()],

      tracesSampleRate: 1.0,
    });
  }
}
