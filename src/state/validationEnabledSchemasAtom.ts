import { useFeature } from 'hooks/useFeature';
import { useEffect, useMemo } from 'react';
import { atom, RecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import {
  ExtendedValidateResources,
  getExtendedValidateResourceState,
  validateResourcesState,
} from './preferences/validateResourcesAtom';
import {
  emptyValidationSchema,
  getEnabledRules,
  ValidationSchema,
  validationSchemasState,
} from './validationSchemasAtom';

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

export const useGetValidationEnabledSchemas = async () => {
  const setSchemas = useSetRecoilState(validationSchemasEnabledState);

  const validationSchemas = useRecoilValue(validationSchemasState);
  const validationFeature = useFeature(
    'RESOURCE_VALIDATION',
  ) as ValidationFeatureConfig;
  const validationPreferences = getExtendedValidateResourceState(
    useRecoilValue(validateResourcesState),
  );

  const policySet = useMemo(() => {
    const policyNames = getEnabledPolicyNames(
      validationFeature,
      validationPreferences,
    );

    return policyNames.reduce((agg, policyReference) => {
      agg.add(policyReference);
      return agg;
    }, new Set()) as Set<PolicyReference>;
  }, [validationFeature, validationPreferences]) as Set<PolicyReference>;

  useEffect(() => {
    if (!validationSchemas) setSchemas(emptyValidationSchema);
    else {
      const { rules, policies } = validationSchemas;

      const enabledPolicies = policies.filter(policy =>
        policySet.has(policy.name),
      );
      const enabledRules = getEnabledRules(rules, enabledPolicies, policies);

      setSchemas({
        rules: enabledRules,
        policies: enabledPolicies,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationSchemas, policySet]);
};

export const validationSchemasEnabledState: RecoilState<ValidationSchema | null> = atom<ValidationSchema | null>(
  {
    key: 'validationEnabledSchemasState',
    default: emptyValidationSchema,
  },
);
