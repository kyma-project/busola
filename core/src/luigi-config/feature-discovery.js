import * as jp from 'jsonpath';
import { getCurrentConfig } from './cluster-management/cluster-management';
import { apiGroup } from './feature-checks';

// convert features from old format (selectors) to new format (checks)
export function convertStaticFeatures(features = {}) {
  return Object.fromEntries(
    Object.entries(features).map(([key, feature]) => {
      if (feature.selectors) {
        feature.checks = feature.selectors.map(selector =>
          apiGroup(selector.apiGroup),
        );
        delete feature.selectors;
        feature.stage = 'PRIMARY';
      }
      return [key, feature];
    }),
  );
}

export function arrayCombine(arrays) {
  const _arrayCombine = (arrs, current = []) => {
    if (arrs.length === 1) {
      return arrs[0].map(e => [...current, e]);
    } else {
      return arrs[0].map(e => _arrayCombine(arrs.slice(1), [...current, e]));
    }
  };

  return _arrayCombine(arrays).flat(arrays.length - 1);
}

export const discoverFeature = async (featureConfig, data = {}) => {
  if (!featureConfig) {
    return { isEnabled: false };
  }

  // disabled explicitly
  if (featureConfig.isEnabled === false) {
    return featureConfig;
  }

  const initialConfig = { ...featureConfig, isEnabled: true };
  const result = await (featureConfig.checks || [])?.reduce(
    async (config, check) => {
      config = await config;
      if (!config.isEnabled) return config;
      const newPartialConfig = await check(config, featureConfig, data);
      return {
        ...config,
        ...newPartialConfig,
        isEnabled: config.isEnabled && newPartialConfig.isEnabled,
      };
    },
    Promise.resolve(initialConfig),
  );
  return { ...featureConfig, ...result };
};

export const discoverFeatures = async (features, data = {}, stage) => {
  const filterFeatures = stage
    ? featureConfig => featureConfig.stage === stage
    : // stage not specified, just discover rest of the features
      featureConfig =>
        featureConfig.stage !== 'PRIMARY' &&
        featureConfig.stage !== 'SECONDARY';

  const featuresToDiscover = Object.entries(
    features,
  ).filter(([, featureConfig]) => filterFeatures(featureConfig));

  for (const [featureName, featureConfig] of featuresToDiscover) {
    features[featureName] = await discoverFeature(featureConfig, data);
  }
  return features;
};

export async function getFeatures(data) {
  const rawFeatures = (await getCurrentConfig()).features;
  var features = await discoverFeatures(rawFeatures, data, 'PRIMARY');
  return features;
}

export function updateFeatures(featureName, featureConfig) {
  console.log('todo');
  // features = { ...features, [featureName]: featureConfig };

  // const config = window.Luigi.getConfig();
  // // set context of all first-level nodes
  // config.navigation.nodes.forEach(node =>
  //   jp.value(node, '$.context.features', features),
  // );
  // window.Luigi.configChanged('navigation.nodes');
}
