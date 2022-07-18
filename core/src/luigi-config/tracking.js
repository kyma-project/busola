import { getCurrentConfig } from './cluster-management/cluster-management';
import { config } from './config';
import { v4 as uuid } from 'uuid';
import { getSSOAuthData } from './auth/sso';

function getLoggingId() {
  const STORAGE_KEY = 'busola.logging-id';

  let loggingId = localStorage.getItem(STORAGE_KEY);
  if (!loggingId) {
    loggingId = uuid();
    localStorage.setItem(STORAGE_KEY, loggingId);
  }
  return loggingId;
}

export async function sendTrackingRequest(body) {
  if ((await getCurrentConfig()).features.TRACKING.isEnabled) {
    body.metadata = { ...body.metadata, id: getLoggingId() };

    let additionalOptions = {};
    const ssoData = getSSOAuthData();
    if (ssoData?.idToken) {
      additionalOptions = {
        headers: {
          Authorization: `Bearer ${ssoData.idToken}`,
        },
      };
    }

    fetch(config.backendAddress + '/tracking', {
      method: 'POST',
      body: JSON.stringify(body),
      ...additionalOptions,
    }).catch(e => console.debug('Tracking call failed', e));
  }
}
