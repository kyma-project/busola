import { useRecoilValue } from 'recoil';
import { configurationAtom } from 'state/configurationAtom';
import { ConfigFeature, ConfigFeaturesNames } from 'state/types';

export function useFeature<T extends ConfigFeature>(
  featureName: ConfigFeaturesNames,
): T {
  const configuration = useRecoilValue(configurationAtom);
  const result = configuration?.features?.[featureName] ?? { isEnabled: false };
  return result as T;
}
