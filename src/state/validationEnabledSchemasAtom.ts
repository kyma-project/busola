import { useEffect, useMemo } from 'react';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import {
  ExtendedValidateResources,
  getExtendedValidateResourceState,
  validateResourcesAtom,
} from './settings/validateResourcesAtom';
import {
  emptyValidationSchema,
  getEnabledRules,
  ValidationPolicy,
  ValidationSchema,
  validationSchemasAtom,
} from './validationSchemasAtom';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from './types';

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
    return (
      validationPreferences.policies ??
      validationFeature?.config?.policies ??
      []
    );
  }
  return [];
};

export const usePolicySet = () => {
  const validationFeature = useFeature(
    configFeaturesNames.RESOURCE_VALIDATION,
  ) as ValidationFeatureConfig;
  const validateResources = useAtomValue(validateResourcesAtom);
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
  const setSchemas = useSetAtom(validationSchemasEnabledAtom);

  const validationSchemas = useAtomValue(validationSchemasAtom);
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

export const validationSchemasEnabledAtom = atom<ValidationSchema>(
  emptyValidationSchema,
);
validationSchemasEnabledAtom.debugLabel = 'validationSchemasEnabledAtom';
