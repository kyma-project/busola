import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';

export type ExtendedValidateResources = {
  isEnabled: boolean;
  policies?: string[];
  userModified?: boolean;
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
    if (configPolicies.length === 0) return;

    if (typeof validateResources === 'boolean') {
      // Upgrade old boolean format to object shape
      setValidateResources({
        isEnabled: validateResources,
        policies: configPolicies,
        userModified: false,
      });
    } else if (validateResources.userModified === undefined) {
      // Migrate old object format: sync policies from current config
      setValidateResources({
        isEnabled: validateResources.isEnabled,
        policies: configPolicies,
        userModified: false,
      });
    }
  }, [validateResources, configPolicies, setValidateResources]);

  return useMemo(() => {
    const extendedState = getExtendedValidateResourceState(validateResources);

    // When the user hasn't explicitly customized policies, always defer to the
    // feature-flag config so admin changes are reflected immediately.
    const effectivePolicies =
      extendedState.userModified === true
        ? (extendedState.policies ?? configPolicies)
        : configPolicies;

    return [
      {
        isEnabled: extendedState.isEnabled,
        policies: effectivePolicies,
      },
      setValidateResources,
    ] as const;
  }, [validateResources, configPolicies, setValidateResources]);
};
