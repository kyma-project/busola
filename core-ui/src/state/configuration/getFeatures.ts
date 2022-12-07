import { ApiGroupState } from 'state/discoverability/apiGroupsSelector';
import {
  ConfigFeature,
  ConfigFeatureList,
  configFeaturesNames,
} from 'state/types';

export async function getFeatures(
  rawFeatures: ConfigFeatureList | undefined,
  api: ApiGroupState,
) {
  const resolvedFeatures = {} as ConfigFeatureList;
  for (const featureName in rawFeatures) {
    const configFeatureName = featureName as keyof typeof configFeaturesNames;
    const rawFeatureConfig = rawFeatures?.[configFeatureName];
    resolvedFeatures[configFeatureName] = await discoverFeature(
      featureName,
      rawFeatureConfig,
      api,
    );
  }
  // lastResolvedFeatures = resolvedFeatures;
  return resolvedFeatures;
}

export async function discoverFeature(
  featureName: string,
  rawFeatureConfig: ConfigFeature | undefined,
  apis: ApiGroupState,
) {
  try {
    if (!rawFeatureConfig) {
      console.debug('discoverFeature: not found ', featureName);
      return { isEnabled: false };
    }

    // not active yet or disabled explicitly
    console.log(rawFeatureConfig);

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
      console.log('----', newPartialConfig);
      currentConfig = { ...currentConfig, ...newPartialConfig };
    }
    return currentConfig;
  } catch (e) {
    console.warn('Error setting up feature', featureName, e);
    return { ...rawFeatureConfig, isEnabled: false };
  }
}
