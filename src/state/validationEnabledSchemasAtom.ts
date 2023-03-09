import { useFeature } from 'hooks/useFeature';
import { useEffect } from 'react';
import { atom, RecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import {
  emptyValidationSchema,
  getEnabledRules,
  ValidationSchema,
  validationSchemasState,
} from './validationSchemasAtom';

type PolicyReference = string;

type ValidationFeatureConfig = {
  isEnabled: boolean;
  config: {
    policies: PolicyReference[];
  };
};

export const useGetValidationEnabledSchemas = async () => {
  const setSchemas = useSetRecoilState(validationSchemasEnabledState);

  const validationSchemas = useRecoilValue(validationSchemasState);
  const validationFeature = useFeature('VALIDATION') as ValidationFeatureConfig;
  const validationPreferences = {};

  useEffect(() => {
    console.log('useGetValidationEnabledSchemas');
    if (!validationSchemas) setSchemas(emptyValidationSchema);
    else {
      const { rules, policies } = validationSchemas;

      const { isEnabled, config } = validationFeature;

      const policySet = (config?.policies ?? []).reduce(
        (agg, policyReference) => {
          agg.add(policyReference);
          return agg;
        },
        new Set(),
      ) as Set<PolicyReference>;

      const enabledPolicies = policies.filter(policy =>
        policySet.has(policy.name),
      );
      const enabledRules = getEnabledRules(rules, enabledPolicies);

      // console.log('useGetValidationEnabledSchemas', config, enabledRules, enabledPolicies, rules, policies);

      setSchemas({
        rules: enabledRules,
        policies: enabledPolicies,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationSchemas, validationFeature]);
};

export const validationSchemasEnabledState: RecoilState<ValidationSchema | null> = atom<ValidationSchema | null>(
  {
    key: 'validationEnabledSchemasState',
    default: emptyValidationSchema,
  },
);
