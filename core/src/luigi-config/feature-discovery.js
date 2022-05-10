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
          apiGroup(selector.apiGroup),
        );
        delete feature.selectors;
        feature.stage = 'PRIMARY';
      }
      return [key, feature];
    }),
  );
}

export async function reloadNodes() {
  try {
    const activeCluster = getActiveCluster();
    const permissionSet = await fetchPermissions(
      getAuthData(),
      getCurrentContextNamespace(activeCluster.kubeconfig),
    );

    const { data } = await fetchCache.get('/apis');
    const groupVersions = extractGroupVersions(data);
    const cfg = window.Luigi.getConfig();
    cfg.navigation.nodes = await createNavigationNodes(
      lastResolvedFeatures,
      groupVersions,
      permissionSet,
    );
    window.Luigi.setConfig(cfg);
    window.Luigi.configChanged('navigation.nodes');
  } catch (e) {
    console.warn('reloadNodes failed', e, window.Luigi.initialized);
  }
}

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

let rawFeatures = {};
export async function initFeatures() {
  rawFeatures = (await getCurrentConfig()).features;

  for (const featureName in rawFeatures) {
    const featureConfig = rawFeatures[featureName];
    if (featureConfig?.stage === 'PRIMARY') {
      rawFeatures[featureName].active = true;
    }
  }
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

async function updateFeaturesContext() {
  configChanged({
    valuePath: '$.context.features',
    value: lastResolvedFeatures,
    scope: 'navigation.nodes',
  });
}

export async function updateFeature(featureName) {
  const resolvedFeature = await discoverFeature(
    featureName,
    rawFeatures[featureName],
  );

  const prevResolved = lastResolvedFeatures[featureName];
  if (JSON.stringify(prevResolved) !== JSON.stringify(resolvedFeature)) {
    lastResolvedFeatures[featureName] = resolvedFeature;

    console.log('update ctx cause', featureName);
    await updateFeaturesContext();
    if (resolvedFeature.updateNavigation) {
      console.log('reload nodes cause', featureName);
      await reloadNodes();
    }
  }
}

const featureSubscribers = {};

async function updateFeatureSubscribers(featureName) {
  if (rawFeatures[featureName]) {
    const active = !!featureSubscribers[featureName].length;
    if (rawFeatures[featureName].active !== active) {
      rawFeatures[featureName].active = active;
      await updateFeature(featureName);
    }
  }
}

export const featureCommunicationEntries = {
  'busola.startRequestFeature': async ({ featureName, requestId }) => {
    if (!featureSubscribers[featureName]) {
      featureSubscribers[featureName] = [];
    }
    featureSubscribers[featureName].push(requestId);

    await updateFeatureSubscribers(featureName);
  },
  'busola.stopRequestFeature': async ({ featureName, requestId }) => {
    featureSubscribers[featureName] = featureSubscribers[featureName].filter(
      id => id !== requestId,
    );

    await updateFeatureSubscribers(featureName);
  },
};
