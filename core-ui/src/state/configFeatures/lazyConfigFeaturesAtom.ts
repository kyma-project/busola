import { atom, RecoilState } from 'recoil';
import { LazyConfigFeatureList } from '../types';

export const lazyConfigFeaturesState: RecoilState<LazyConfigFeatureList> = atom<
  LazyConfigFeatureList
>({
  key: 'lazyConfigFeaturesState',
});
