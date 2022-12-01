import { useRecoilValue } from 'recoil';
import { configurationAtom } from 'state/configurationAtom';
import { ConfigFeature, ConfigFeaturesNames } from 'state/types';

export function useFeature<T extends ConfigFeature>(
  featureName: ConfigFeaturesNames,
): T | undefined {
  const configuration = useRecoilValue(configurationAtom);
  return configuration?.features?.[featureName] as T;
}
