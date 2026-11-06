import { atomWithStorage } from 'jotai/utils';

export const dismissedBannersAtom = atomWithStorage<string[]>(
  'busola.dismissedBanners',
  [],
);
