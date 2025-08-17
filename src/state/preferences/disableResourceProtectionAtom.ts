import { atomWithStorage } from 'jotai/utils';

type DisableResourceProtection = boolean;

const DISABLE_RESOURCE_PROTECTION_STORAGE_KEY =
  'busola.disableResourceProtection';
const DEFAULT_DISABLE_RESOURCE_PROTECTION = false;

export const disableResourceProtectionState = atomWithStorage<
  DisableResourceProtection
>(DISABLE_RESOURCE_PROTECTION_STORAGE_KEY, DEFAULT_DISABLE_RESOURCE_PROTECTION);
disableResourceProtectionState.debugLabel = 'disableResourceProtectionState';
