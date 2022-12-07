import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';
import {
  ConfigFeature,
  ConfigFeatureList,
  configFeaturesNames,
} from 'state/types';

export async function getFeatures(rawFeatures: ConfigFeatureList | undefined) {
  const resolvedFeatures = {} as ConfigFeatureList;
  for (const featureName in rawFeatures) {
    const configFeatureName = featureName as keyof typeof configFeaturesNames;
    const rawFeatureConfig = rawFeatures?.[configFeatureName];
    resolvedFeatures[configFeatureName] = await discoverFeature(
      featureName,
      rawFeatureConfig,
    );
  }
  // lastResolvedFeatures = resolvedFeatures;
  return resolvedFeatures;
}

export async function discoverFeature(
  featureName: string,
  rawFeatureConfig: ConfigFeature | undefined,
) {
  try {
    if (!rawFeatureConfig) {
      console.debug('discoverFeature: not found ', featureName);
      return { isEnabled: false };
    }

    // not active yet or disabled explicitly

    // todo active
    // if (!rawFeatureConfig.active || rawFeatureConfig.isEnabled === false) {
    //   return rawFeatureConfig;
    // }

    if (rawFeatureConfig.isEnabled === false) {
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
