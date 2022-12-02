import { useRecoilValue } from 'recoil';
import { configurationAtom } from 'state/configurationAtom';
import { ConfigFeature, ConfigFeaturesNames } from 'state/types';

export function useFeature<T extends ConfigFeature>(
  featureName: ConfigFeaturesNames,
): T | undefined {
  const configuration = useRecoilValue(configurationAtom);
  const feature = configuration?.features?.[featureName] ?? {
    isEnabled: false,
  };
  return feature as T;
}
