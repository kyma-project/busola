import { useEffect, useMemo } from 'react';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useSyncedValidateResources } from './settings/validateResourcesAtom';
import {
  emptyValidationSchema,
  getEnabledRules,
  ValidationPolicy,
  ValidationSchema,
  validationSchemasAtom,
} from './validationSchemasAtom';

type PolicyReference = string;

export type ValidationFeatureConfig = {
  isEnabled: boolean;
  config: {
    policies: PolicyReference[];
  };
};

export const usePolicySet = () => {
  const [{ isEnabled, policies }] = useSyncedValidateResources();

  return useMemo(() => {
    if (!isEnabled) return new Set<string>();
    return new Set(policies) as Set<PolicyReference>;
  }, [isEnabled, policies]);
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
  }, [validationSchemas, policySet, setSchemas]);
};

export const validationSchemasEnabledAtom = atom<ValidationSchema>(
  emptyValidationSchema,
);
validationSchemasEnabledAtom.debugLabel = 'validationSchemasEnabledAtom';
