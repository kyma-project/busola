import { atom, RecoilState } from 'recoil';

type ConfigFeature = {
  isEnabled?: boolean;
  stage?: 'PRIMARY' | 'SECONDARY';
  [key: string]: any;
};
type ConfigFeaturesState = Record<string, ConfigFeature>;

const defaultValue = {};

export const configFeaturesState: RecoilState<ConfigFeaturesState> = atom<
  ConfigFeaturesState
>({
  key: 'configFeaturesState',
  default: defaultValue,
  effects: [
    ({ onSet, resetSelf }) => {
      onSet((newValue, oldValue) => {});
    },
  ],
});
