import { atomWithStorage } from 'jotai/utils';

export type ExtendedValidateResources = {
  isEnabled: boolean;
  choosePolicies: boolean;
  policies?: string[];
};

export type ValidateResources = boolean | ExtendedValidateResources;

const VALIDATE_RESOURCES_STORAGE_KEY = 'busola.validateResources';
const DEFAULT_VALIDATE_RESOURCES = true;

export const validateResourcesState = atomWithStorage<ValidateResources>(
  VALIDATE_RESOURCES_STORAGE_KEY,
  DEFAULT_VALIDATE_RESOURCES,
);
validateResourcesState.debugLabel = 'validateResourcesState';

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
