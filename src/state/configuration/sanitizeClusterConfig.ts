import { ConfigFeaturesNames, configFeaturesNames } from '../types';

// Feature flags that a viewed (untrusted) cluster must not be able to set via
// its kube-public/busola-config ConfigMap; honored only from installation config.
export const CLUSTER_IMMUTABLE_FEATURES: ConfigFeaturesNames[] = [
  configFeaturesNames.EXTENSIBILITY_CUSTOM_COMPONENTS,
  configFeaturesNames.PROTECTED_RESOURCES,
  configFeaturesNames.HIDDEN_NAMESPACES,
];

// Returns a copy of the cluster-supplied config with CLUSTER_IMMUTABLE_FEATURES
// stripped so an untrusted cluster cannot override them. Input is not mutated.
export function sanitizeClusterConfig<
  T extends { features?: any } | null | undefined,
>(clusterConfig: T): T {
  if (!clusterConfig || typeof clusterConfig !== 'object') {
    return clusterConfig;
  }

  const { features } = clusterConfig;
  if (!features || typeof features !== 'object') {
    return clusterConfig;
  }

  const removed = CLUSTER_IMMUTABLE_FEATURES.filter((name) => name in features);
  const immutable = new Set<string>(CLUSTER_IMMUTABLE_FEATURES);
  const sanitizedFeatures = Object.fromEntries(
    Object.entries(features).filter(([name]) => !immutable.has(name)),
  );

  if (removed.length > 0) {
    console.warn(
      'Ignoring security-relevant feature flag(s) supplied by the cluster ' +
        `busola-config ConfigMap: ${removed.join(', ')}. ` +
        'These can only be configured in the Busola installation configuration.',
    );
  }

  return { ...clusterConfig, features: sanitizedFeatures };
}
