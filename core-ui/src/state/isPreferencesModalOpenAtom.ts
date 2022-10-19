import { atom, AtomEffect } from 'recoil';
import LuigiClient from '@luigi-project/client';

const DEFAULT_IS_PREFERENCES_MODAL_OPENED = false;

type backdropEffectFn = () => AtomEffect<boolean>;

export const backdropEffect: backdropEffectFn = () => ({ onSet }) => {
  onSet(newValue => {
    if (newValue) LuigiClient.uxManager().addBackdrop();
  });
};

export const isPreferencesModalOpenState = atom<boolean>({
  key: 'isPreferencesModalOpenedState',
  default: DEFAULT_IS_PREFERENCES_MODAL_OPENED,
  effects: [backdropEffect()],
});
