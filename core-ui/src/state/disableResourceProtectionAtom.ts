import { atom } from 'recoil';
import { localStorageEffect } from './helpers';

const DISABLE_RESOURCE_PROTECTION_STORAGE_KEY =
  'busola.disableResourceProtection';
const DEFAULT_DISABLE_RESOURCE_PROTECTION = false;

export const disableResourceProtectionState = atom<boolean>({
  key: 'disableResourceProtection',
  default: DEFAULT_DISABLE_RESOURCE_PROTECTION,
  effects: [
    localStorageEffect<boolean>(DISABLE_RESOURCE_PROTECTION_STORAGE_KEY),
  ],
});
