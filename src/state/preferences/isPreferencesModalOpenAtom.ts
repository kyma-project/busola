import { atom, RecoilState } from 'recoil';

type IsPreferencesOpen = boolean;

const DEFAULT_IS_PREFERENCES_MODAL_OPEN = false;

export const isPreferencesOpenState: RecoilState<IsPreferencesOpen> = atom<
  IsPreferencesOpen
>({
  key: 'isPreferencesModalOpenedState',
  default: DEFAULT_IS_PREFERENCES_MODAL_OPEN,
});
