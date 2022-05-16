import { getAuthData } from './auth/auth-storage';
import { fetchCache } from './cache/fetch-cache';
import {
  getActiveCluster,
  getCurrentConfig,
  getCurrentContextNamespace,
} from './cluster-management/cluster-management';
import { apiGroup } from './feature-checks';
import { createNavigationNodes } from './navigation/navigation-data-init';
import { fetchPermissions } from './navigation/queries';
import { configChanged } from './utils/configChanged';
import { extractGroupVersions } from './utils/extractGroupVersions';

// convert features from old format (selectors) to new format (checks)
export function convertStaticFeatures(features = {}) {
  return Object.fromEntries(
    Object.entries(features).map(([key, feature]) => {
      if (feature.selectors) {
        feature.checks = feature.selectors.map(selector =>
          apiGroup({ group: selector.apiGroup }),
        );
        delete feature.selectors;
        feature.stage = 'PRIMARY';
      }
      return [key, feature];
    }),
  );
}

// re-run the checks for the feature
export async function discoverFeature(featureName, rawFeatureConfig) {
  try {
    if (!rawFeatureConfig) {
      console.debug('discoverFeature: not found ', featureName);
      return { isEnabled: false };
    }

    for (const cleanup of rawFeatureConfig.cleanups || []) {
      cleanup();
    }
    rawFeatureConfig.cleanups = [];

    // not active yet or disabled explicitly
    if (!rawFeatureConfig.active || rawFeatureConfig.isEnabled === false) {
      return rawFeatureConfig;
    }

    // assume feature is enabled by default
    let currentConfig = { ...rawFeatureConfig, isEnabled: true };
    for (const check of rawFeatureConfig.checks || []) {
      if (!currentConfig.isEnabled) {
        return currentConfig;
      }
      const newPartialConfig = await check(featureName, currentConfig);
      currentConfig = { ...currentConfig, ...newPartialConfig };
    }
    return currentConfig;
  } catch (e) {
    console.warn('Error setting up feature', featureName, e);
    return { ...rawFeatureConfig, isEnabled: false };
  }
}

// only the feature configurations
let rawFeatures = {};

// load feature configuration and run the PRIMARY features
export async function initFeatures() {
  rawFeatures = (await getCurrentConfig()).features;

  for (const featureName in rawFeatures) {
    const featureConfig = rawFeatures[featureName];
    if (featureConfig?.stage === 'PRIMARY') {
      rawFeatures[featureName].active = true;
    }
  }
}

// resolved feature configurations
let lastResolvedFeatures = {};
export async function getFeatures() {
  const resolvedFeatures = {};
  for (const featureName in rawFeatures) {
    const rawFeatureConfig = rawFeatures[featureName];
    resolvedFeatures[featureName] = await discoverFeature(
      featureName,
      rawFeatureConfig,
    );
  }
  lastResolvedFeatures = resolvedFeatures;
  return resolvedFeatures;
}

export async function resolveSecondaryFeatures() {
  for (const featureName in rawFeatures) {
    const featureConfig = rawFeatures[featureName];
    if (featureConfig?.stage === 'SECONDARY') {
      rawFeatures[featureName].active = true;
      await updateFeature(featureName);
    }
  }
}

export async function updateFeature(featureName) {
  const updateFeaturesContext = async () => {
    configChanged({
      valuePath: '$.context.features',
      value: lastResolvedFeatures,
      scope: 'navigation.nodes',
    });
  };

  const reloadNodes = async () => {
    try {
      const activeCluster = getActiveCluster();
      const permissionSet = await fetchPermissions(
        getAuthData(),
        getCurrentContextNamespace(activeCluster.kubeconfig),
      );

      const { data } = await fetchCache.get('/apis');
      const groupVersions = extractGroupVersions(data);
      const cfg = Luigi.getConfig();
      cfg.navigation.nodes = await createNavigationNodes(
        lastResolvedFeatures,
        groupVersions,
        permissionSet,
      );
      Luigi.configChanged('navigation.nodes');
    } catch (e) {
      console.warn('reloadNodes failed', e);
    }
  };

  const resolvedFeature = await discoverFeature(
    featureName,
    rawFeatures[featureName],
  );

  const prevResolved = lastResolvedFeatures[featureName];
  if (JSON.stringify(prevResolved) !== JSON.stringify(resolvedFeature)) {
    lastResolvedFeatures[featureName] = resolvedFeature;

    await updateFeaturesContext();
    if (resolvedFeature.updateNodes) {
      await reloadNodes();
    }
  }
}

// counter (with feature name as a key) for iframe subscribers
const featureSubscribers = {};

// turn feature on/off based on iframe subscriber count
async function updateFeatureSubscribers(featureName) {
  if (rawFeatures[featureName]) {
    const targetActive = !!featureSubscribers[featureName];
    if (rawFeatures[featureName].active !== targetActive) {
      rawFeatures[featureName].active = targetActive;
      await updateFeature(featureName);
    }
  }
}

export const featureCommunicationEntries = {
  'busola.startRequestFeature': async ({ featureName }) => {
    if (!featureSubscribers[featureName]) {
      featureSubscribers[featureName] = 0;
    }
    featureSubscribers[featureName]++;
    await updateFeatureSubscribers(featureName);
  },
  'busola.stopRequestFeature': async ({ featureName }) => {
    featureSubscribers[featureName]--;
    await updateFeatureSubscribers(featureName);
  },
};
