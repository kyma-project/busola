import { atom, RecoilState } from 'recoil';
import { ConfigFeatureList } from './types';

const defaultValue = {};

export const configFeaturesState: RecoilState<ConfigFeatureList> = atom<
  ConfigFeatureList
>({
  key: 'configFeaturesState',
  default: defaultValue,
});
