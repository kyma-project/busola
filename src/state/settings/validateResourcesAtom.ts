import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';

export type ExtendedValidateResources = {
  isEnabled: boolean;
  policies?: string[];
};

export type ValidateResources = boolean | ExtendedValidateResources;

const VALIDATE_RESOURCES_STORAGE_KEY = 'busola.validateResources';
const DEFAULT_VALIDATE_RESOURCES = true;

export const validateResourcesAtom = atomWithStorage<ValidateResources>(
  VALIDATE_RESOURCES_STORAGE_KEY,
  DEFAULT_VALIDATE_RESOURCES,
);
validateResourcesAtom.debugLabel = 'validateResourcesAtom';

export const getExtendedValidateResourceState = (
  validateResources: ValidateResources,
): ExtendedValidateResources => {
  if (typeof validateResources === 'boolean') {
    return {
      isEnabled: validateResources,
    };
  } else {
    return validateResources;
  }
};

export const useSyncedValidateResources = () => {
  const [validateResources, setValidateResources] = useAtom(
    validateResourcesAtom,
  );

  const validationFeature = useFeature(configFeaturesNames.RESOURCE_VALIDATION);

  const configPolicies = useMemo(() => {
    return validationFeature?.isEnabled
      ? validationFeature.config?.policies || []
      : [];
  }, [validationFeature]);

  useEffect(() => {
    if (typeof validateResources === 'boolean' && configPolicies.length > 0) {
      setValidateResources({
        isEnabled: validateResources,
        policies: configPolicies,
      });
    }
  }, [validateResources, configPolicies, setValidateResources]);

  return useMemo(() => {
    const extendedState = getExtendedValidateResourceState(validateResources);

    return [
      {
        isEnabled: extendedState.isEnabled,
        policies: extendedState.policies ?? configPolicies,
      },
      setValidateResources,
    ] as const;
  }, [validateResources, configPolicies, setValidateResources]);
};
