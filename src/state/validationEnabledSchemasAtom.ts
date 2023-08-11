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
  getResolvedPolicy,
  DatreeCustomRule,
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

type DatreeCustomPolicies = {
  apiVersion: string;
  policies: {
    name: string;
    isDefault: boolean;
    rules: {
      identifier: string;
      messageOnFailure: string;
    }[];
  }[];
  customRules: DatreeCustomRule[];
};

/**
 * The datree format differs between its own rules and the custom rules via 'policy as code'.
 * This function converts the rules of a given rule set and selected policies into a format,
 * which can be used in datree via the --policy-config option.
 */
export const convertPoliciesForDatree = (
  validationSchemas: ValidationSchema,
  policySet: Set<string>,
): DatreeCustomPolicies => {
  const enabledSchemas = getValidationEnabledSchemas(
    validationSchemas,
    policySet,
  );

  const customRules = enabledSchemas.rules.map(
    ({ uniqueName, name, schema, messageOnFailure }) => {
      return {
        identifier: uniqueName,
        name: name ?? uniqueName,
        defaultMessageOnFailure:
          messageOnFailure ?? `Rule ${uniqueName} failed`,
        schema,
      };
    },
  );

  const policies = enabledSchemas.policies.map(policy => {
    const resolvedPolicy = getResolvedPolicy(
      policy,
      validationSchemas.policies,
    );
    const rules = resolvedPolicy.rules.map(rule => {
      if (typeof rule === 'string') {
        const messageOnFailure =
          customRules.find(({ identifier }) => identifier)
            ?.defaultMessageOnFailure || `Rule ${rule} failed`;
        return {
          identifier: rule,
          messageOnFailure,
        };
      } else {
        return {
          identifier: rule.identifier,
          messageOnFailure: rule.messageOnFailure ?? `Rule ${rule} failed`,
        };
      }
    });

    return {
      name: resolvedPolicy.name,
      isDefault: false,
      rules,
    };
  });
  if (policies.length > 0) {
    policies[0].isDefault = true;
  }

  const customPolicyDefinition = {
    apiVersion: 'v1',
    policies,
    customRules,
  };
  return customPolicyDefinition;
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
    'RESOURCE_VALIDATION',
  ) as ValidationFeatureConfig;
  const validateResources = useRecoilValue(validateResourcesState);
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

  const enabledPolicies = policies.filter(policy => policySet.has(policy.name));
  const enabledRules = getEnabledRules(rules, enabledPolicies, policies);

  return {
    rules: enabledRules,
    policies: enabledPolicies,
  };
};

export const useGetValidationEnabledSchemas = () => {
  const setSchemas = useSetRecoilState(validationSchemasEnabledState);

  const validationSchemas = useRecoilValue(validationSchemasState);
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

export const validationSchemasEnabledState: RecoilState<ValidationSchema | null> = atom<ValidationSchema | null>(
  {
    key: 'validationEnabledSchemasState',
    default: emptyValidationSchema,
  },
);
