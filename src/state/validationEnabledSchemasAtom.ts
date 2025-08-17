import { useFeature } from 'hooks/useFeature';
import { useEffect, useMemo } from 'react';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import {
  ExtendedValidateResources,
  getExtendedValidateResourceState,
  validateResourcesState,
} from './preferences/validateResourcesAtom';
import {
  emptyValidationSchema,
  getEnabledRules,
  ValidationPolicy,
  ValidationSchema,
  validationSchemasState,
} from './validationSchemasAtom';
import { configFeaturesNames } from 'state/types';

type PolicyReference = string;

export type ValidationFeatureConfig = {
  isEnabled: boolean;
  config: {
    policies: PolicyReference[];
  };
};

const getEnabledPolicyNames = (
  validationFeature: ValidationFeatureConfig,
  validationPreferences: ExtendedValidateResources,
): PolicyReference[] => {
  if (validationPreferences.isEnabled) {
    if (validationPreferences.choosePolicies) {
      return validationPreferences.policies ?? [];
    } else if (
      validationFeature.isEnabled &&
      validationFeature.config?.policies
    ) {
      return validationFeature.config.policies ?? [];
    }
  }
  return [];
};

export const usePolicySet = () => {
  const validationFeature = useFeature(
    configFeaturesNames.RESOURCE_VALIDATION,
  ) as ValidationFeatureConfig;
  const validateResources = useAtomValue(validateResourcesState);
  const validationPreferences = useMemo(
    () => getExtendedValidateResourceState(validateResources),
    [validateResources],
  );

  return useMemo(() => {
    const policyNames = getEnabledPolicyNames(
      validationFeature,
      validationPreferences,
    );

    return policyNames.reduce((agg, policyReference) => {
      agg.add(policyReference);
      return agg;
    }, new Set()) as Set<PolicyReference>;
  }, [validationFeature, validationPreferences]) as Set<PolicyReference>;
};

export const getValidationEnabledSchemas = (
  validationSchemas: ValidationSchema,
  policySet: Set<PolicyReference>,
) => {
  const { rules, policies } = validationSchemas;

  const enabledPolicies = policies.filter((policy: ValidationPolicy) =>
    policySet.has(policy.name),
  );
  const enabledRules = getEnabledRules(rules, enabledPolicies, policies);

  return {
    rules: enabledRules,
    policies: enabledPolicies,
  };
};

export const useGetValidationEnabledSchemas = () => {
  const setSchemas = useSetAtom(validationSchemasEnabledState);

  const validationSchemas = useAtomValue(validationSchemasState);
  const policySet = usePolicySet();

  useEffect(() => {
    if (!validationSchemas) setSchemas(emptyValidationSchema);
    else {
      const enabledSchemas = getValidationEnabledSchemas(
        validationSchemas,
        policySet,
      );
      setSchemas(enabledSchemas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationSchemas, policySet]);
};

export const validationSchemasEnabledState = atom<ValidationSchema>(
  emptyValidationSchema,
);
validationSchemasEnabledState.debugLabel = 'validationSchemasEnabledState';
