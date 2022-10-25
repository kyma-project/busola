import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../utils/effects';

type DisableResourceProtection = boolean;

const DISABLE_RESOURCE_PROTECTION_STORAGE_KEY =
  'busola.disableResourceProtection';
const DEFAULT_DISABLE_RESOURCE_PROTECTION = false;

export const disableResourceProtectionState: RecoilState<DisableResourceProtection> = atom<
  DisableResourceProtection
>({
  key: 'disableResourceProtectionState',
  default: DEFAULT_DISABLE_RESOURCE_PROTECTION,
  effects: [
    localStorageEffect<DisableResourceProtection>(
      DISABLE_RESOURCE_PROTECTION_STORAGE_KEY,
    ),
  ],
});
