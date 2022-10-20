import { atom, AtomEffect, RecoilState } from 'recoil';
import LuigiClient from '@luigi-project/client';

const DEFAULT_IS_PREFERENCES_MODAL_OPEN = false;

type backdropEffectFn = () => AtomEffect<boolean>;

export const backdropEffect: backdropEffectFn = () => ({ onSet }) => {
  onSet(newValue => {
    if (newValue) LuigiClient.uxManager().addBackdrop();
    else LuigiClient.uxManager().removeBackdrop();
  });
};

export const isPreferencesModalOpenState: RecoilState<boolean> = atom<boolean>({
  key: 'isPreferencesModalOpenedState',
  default: DEFAULT_IS_PREFERENCES_MODAL_OPEN,
  effects: [backdropEffect()],
});
