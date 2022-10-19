import { atom, RecoilState } from 'recoil';
import { ConfigFeatureList } from './types';

type ConfigFeaturesState = ConfigFeatureList | null;

const defaultValue = null;

export const configFeaturesState: RecoilState<ConfigFeaturesState> = atom<
  ConfigFeaturesState
>({
  key: 'configFeaturesState',
  default: defaultValue,
});
