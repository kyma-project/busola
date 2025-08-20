import { atomWithStorage } from 'jotai/utils';

type DisableResourceProtection = boolean;

const DISABLE_RESOURCE_PROTECTION_STORAGE_KEY =
  'busola.disableResourceProtection';
const DEFAULT_DISABLE_RESOURCE_PROTECTION = false;

export const disableResourceProtectionAtom = atomWithStorage<
  DisableResourceProtection
>(DISABLE_RESOURCE_PROTECTION_STORAGE_KEY, DEFAULT_DISABLE_RESOURCE_PROTECTION);
disableResourceProtectionAtom.debugLabel = 'disableResourceProtectionAtom';
