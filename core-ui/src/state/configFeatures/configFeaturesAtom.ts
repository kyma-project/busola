import { atom, RecoilState } from 'recoil';
import { ConfigFeatureList } from '../types';

type ConfigFeaturesState = ConfigFeatureList;

export const configFeaturesState: RecoilState<ConfigFeaturesState> = atom<
  ConfigFeaturesState
>({
  key: 'configFeaturesState',
});
