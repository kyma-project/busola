import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from './helpers';

const DISABLE_RESOURCE_PROTECTION_STORAGE_KEY =
  'busola.disableResourceProtection';
const DEFAULT_DISABLE_RESOURCE_PROTECTION = false;

export const disableResourceProtectionState: RecoilState<boolean> = atom<
  boolean
>({
  key: 'disableResourceProtectionState',
  default: DEFAULT_DISABLE_RESOURCE_PROTECTION,
  effects: [
    localStorageEffect<boolean>(DISABLE_RESOURCE_PROTECTION_STORAGE_KEY),
  ],
});
