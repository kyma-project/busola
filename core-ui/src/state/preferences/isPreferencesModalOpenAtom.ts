import { atom, AtomEffect, RecoilState } from 'recoil';
import LuigiClient from '@luigi-project/client';

type backdropEffectFn = () => AtomEffect<boolean>;
type IsPreferencesOpen = boolean;

const backdropEffect: backdropEffectFn = () => ({ onSet }) => {
  onSet(newValue => {
    if (newValue) LuigiClient.uxManager().addBackdrop();
    else LuigiClient.uxManager().removeBackdrop();
  });
};

const DEFAULT_IS_PREFERENCES_MODAL_OPEN = false;

export const isPreferencesOpenState: RecoilState<IsPreferencesOpen> = atom<
  IsPreferencesOpen
>({
  key: 'isPreferencesModalOpenedState',
  default: DEFAULT_IS_PREFERENCES_MODAL_OPEN,
  effects: [backdropEffect()],
});
