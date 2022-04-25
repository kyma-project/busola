import * as jp from 'jsonpath';
import { getBusolaClusterParams } from './busola-cluster-params';
import { getActiveCluster } from './cluster-management/cluster-management';
import { apiGroup } from './feature-checks';

export function convertStaticFeatures(features = {}) {
  return Object.fromEntries(
    Object.entries(features).map(([key, feature]) => {
      if (feature.selectors) {
        feature.checks = feature.selectors.map(selector =>
          apiGroup(selector.apiGroup),
        );
        delete feature.selectors;
        feature.initial = true;
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
  // feature is enabled by default
  if (featureConfig.isEnabled === false) {
    return featureConfig;
  }

  const initialConfig = { ...featureConfig, isEnabled: true };
  const result = await featureConfig.checks?.reduce(async (config, check) => {
    config = await config;
    if (!config.isEnabled) return config;
    const newPartialConfig = await check(config, featureConfig, data);
    return {
      ...config,
      ...newPartialConfig,
      isEnabled: config.isEnabled && newPartialConfig.isEnabled,
    };
  }, Promise.resolve(initialConfig));
  return { ...featureConfig, ...result };
};

export const discoverInitialFeatures = async (features, data = {}) => {
  const initialFirstFeatures = Object.entries(features).filter(
    ([key, feature]) => feature.initial,
  );

  for (const [featureName, featureConfig] of initialFirstFeatures) {
    features[featureName] = await discoverFeature(featureConfig, data);
  }

  return features;
};

let features = null;

// replaces getFeatures from features.js
export async function getFeatures2(data) {
  if (!features) {
    // as a stretch, separate getting active cluster & getting current configuration
    // getActiveCluster -> name + kubeconfig
    // getCurrentConfig -> configuration for active cluster OR configuration for Busola cluster
    const rawFeatures =
      (await getActiveCluster())?.config?.features ||
      (await getBusolaClusterParams())?.config?.features || // in case active cluster is null
      {};
    features = await discoverInitialFeatures(rawFeatures, data);
  }
  return features;
}

export function updateFeatures(featureName, featureConfig) {
  features = { ...features, [featureName]: featureConfig };
  console.log(featureName, featureConfig);

  const config = Luigi.getConfig();
  // set context of all first-level nodes
  config.navigation.nodes.forEach(node =>
    jp.value(node, '$.context.features', features),
  );
  Luigi.configChanged('navigation.nodes');
}
