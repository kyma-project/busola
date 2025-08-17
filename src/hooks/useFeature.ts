import { useAtomValue } from 'jotai';
import { configurationState } from 'state/configuration/configurationAtom';
import { ConfigFeature, ConfigFeaturesNames } from 'state/types';

export function useFeature<T extends ConfigFeature>(
  featureName: ConfigFeaturesNames,
): T {
  const configuration = useAtomValue(configurationState);
  const feature = configuration?.features?.[featureName] ?? {
    isEnabled: false,
  };
  return feature as T;
}
