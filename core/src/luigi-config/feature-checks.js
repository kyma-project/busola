import { fetchCache } from './cache/fetch-cache';
import { updateFeature } from './feature-discovery';
import { getAuthData } from './auth/auth-storage';
import { extractGroupVersions } from './utils/extractGroupVersions';

export function apiGroup(group, refreshIntervalMs = 10000) {
  const containsGroup = groupVersions =>
    groupVersions?.find(g => g.includes(group));

  return async (featureName, featureConfig) => {
    if (!getAuthData()) {
      return { ...featureConfig, isEnabled: false };
    }

    const path = '/apis';
    const { data, unsubscribe } = await fetchCache.subscribe({
      path,
      callback: () => updateFeature(featureName, featureConfig),
      refreshIntervalMs,
    });
    const groupVersions = extractGroupVersions(data);
    featureConfig.cleanups.push(unsubscribe);

    return {
      ...featureConfig,
      isEnabled: !!containsGroup(groupVersions),
    };
  };
}

export function service(
  urlsGenerator,
  validator = async res => res.status < 400,
  refreshIntervalMs,
) {
  const subscribeToAllUrls = async (urls, featureName, featureConfig) => {
    for (const url of urls) {
      const { unsubscribe } = await fetchCache.subscribe({
        path: url,
        callback: () => updateFeature(featureName, featureConfig),
      });
      featureConfig.cleanups.push(unsubscribe);
    }
  };

  const checkSingleUrl = async (url, featureName, featureConfig) => {
    const res = await fetchCache.get(url);
    try {
      const serviceFound = await validator(res);
      if (serviceFound) {
        const { unsubscribe } = await fetchCache.subscribe({
          path: url,
          callback: () => updateFeature(featureName, featureConfig),
          refreshIntervalMs,
        });

        featureConfig.cleanups.push(unsubscribe);
        return { succeeded: true, serviceUrl: url };
      }
    } catch (e) {
      console.debug('service-check', url, e);
    }
    return { succeeded: false };
  };

  return async (featureName, featureConfig) => {
    const urls = urlsGenerator(featureConfig, featureConfig);
    for (const url of urls) {
      const { succeeded, serviceUrl } = await checkSingleUrl(
        url,
        featureName,
        featureConfig,
      );
      if (succeeded) {
        return { ...featureConfig, serviceUrl };
      }
    }
    // service is not available, let's ping all the addresses
    await subscribeToAllUrls(urls, featureName, featureConfig);
    return { ...featureConfig, isEnabled: false };
  };
}
