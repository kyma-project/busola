import { useRecoilValue } from 'recoil';
import { configurationState } from 'state/configurationSelector';
import { ConfigFeature, ConfigFeaturesNames } from 'state/types';

export function useFeature<T extends ConfigFeature>(
  featureName: ConfigFeaturesNames,
): T | undefined {
  const configuration = useRecoilValue(configurationState);
  return configuration?.features?.[featureName] as T;
}
