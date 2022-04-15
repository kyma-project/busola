import { apiGroup } from './feature-checks';

export function convertStaticFeatures(features = {}) {
  return Object.fromEntries(
    Object.entries(features).map(([key, feature]) => {
      if (feature.selectors) {
        feature.checks = feature.selectors.map(selector =>
          apiGroup(selector.apiGroup),
        );
        feature.initial = true;
      }
      return [key, feature];
    }),
  );
}
const xprod = (a, b) => {
  let idx = 0;
  let ilen = a.length;
  let j;
  let jlen = b.length;
  let result = [];

  while (idx < ilen) {
    j = 0;
    while (j < jlen) {
      result[result.length] = [a[idx], b[j]];
      j += 1;
    }
    idx += 1;
  }
  return result;
};
export const xprod3 = (a, b, c) =>
  xprod(a, xprod(b, c)).map(([a, [b, c]]) => [a, b, c]);

export const discoverFeature = (features, featureName, data = {}) => {
  const feature = features[featureName];
  if (!feature) return;

  // TODO sequential async discovery
  feature.checks.reduce(
    async (config, check) => {
      if (!config.isEnabled) return config;
      return await check(config, feature, data);
    },
    { isEnabled: true },
    // TODO update local storage here
  ); // TODO read configuration
};

export const discoverInitialFeatures = (features, data = {}) => {
  // TODO promise and return
  Object.entries(features)
    .filter(([key, feature]) => feature.initial)
    .forEach(([key]) => discoverFeature(key, data));

  return features;
};
