import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../utils/effects';

export type ExtendedValidateResources = {
  isEnabled: boolean;
  choosePolicies: boolean;
  policies?: string[];
};

export type ValidateResources = boolean | ExtendedValidateResources;

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

export const getExtendedValidateResourceState = (
  validateResources: ValidateResources,
): ExtendedValidateResources => {
  if (typeof validateResources === 'boolean') {
    return {
      isEnabled: validateResources,
      choosePolicies: false,
    };
  } else {
    return validateResources;
  }
};
