import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../utils/effects';

type ValidateResources = boolean;

const VALIDATE_RESOURCES_STORAGE_KEY = 'busola.validateResources';
const DEFAULT_VALIDATE_RESOURCES = true;

export const validateResourcesState: RecoilState<ValidateResources> = atom<
  ValidateResources
>({
  key: 'validateResourcesState',
  default: DEFAULT_VALIDATE_RESOURCES,
  effects: [
    localStorageEffect<ValidateResources>(VALIDATE_RESOURCES_STORAGE_KEY),
  ],
});
