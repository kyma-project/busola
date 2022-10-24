import { ConfigFeatureList, NavNode } from '../../types';

export const areNodeFeaturesDisabled = (
  node: NavNode,
  configFeatures: ConfigFeatureList,
): boolean => {
  if (dependsOnConfigFeatures(node)) {
    if (isARequiredFeatureDisabled(node, configFeatures)) {
      return false;
    }
  }
  return true;
};

const dependsOnConfigFeatures = (node: NavNode) =>
  Array.isArray(node.requiredFeatures) && node.requiredFeatures.length;

const isARequiredFeatureDisabled = (
  node: NavNode,
  configFeatures: ConfigFeatureList,
) => {
  return node.requiredFeatures.find(
    resourceRequiredFeatureKey =>
      configFeatures[resourceRequiredFeatureKey]?.isEnabled === false,
  );
};
