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

export const discoverFeature = async (features, featureName, data = {}) => {
  const feature = features[featureName];
  console.log('discoverFeature features', features, 'feature', feature);
  if (!feature) return;
  // TODO sequential async discovery

  const sth = await feature.checks?.reduce(
    async (config, check) => {
      console.log('reduce', config);
      if (!config.isEnabled) return config;
      const newPartialConfig = await check(config, feature, data);
      console.log(
        'reduce! featureName',
        featureName,
        'config',
        config,
        'newPartialConfig',
        newPartialConfig,
      );
      return {
        ...config,
        ...newPartialConfig,
        isEnabled: config.isEnabled && newPartialConfig.isEnabled,
      };
    },
    { isEnabled: true },

    // TODO update local storage here
  );
  console.log('after reduce', sth);
  // TODO read configuration
};

export const discoverInitialFeatures = async (features, data = {}) => {
  // TODO promise and return
  const initialFirstFeatures = Object.entries(features).filter(
    ([key, feature]) => feature.initial,
  );

  for (const initialFirst of initialFirstFeatures) {
    await discoverFeature(features, initialFirst, data);
  }

  return features;
};
