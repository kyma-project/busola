import { useRecoilValue } from 'recoil';
import { configFeaturesState } from 'state/configFeatures/configFeaturesSelector';
import { ConfigFeature, ConfigFeaturesNames } from 'state/types';

export function useFeature<T extends ConfigFeature>(
  featureName: ConfigFeaturesNames,
): T | undefined {
  const features = useRecoilValue(configFeaturesState);
  return features?.config?.features?.[featureName] as T;
}
