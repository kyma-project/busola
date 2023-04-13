import { useEffect } from 'react';
import { authDataState } from 'state/authDataAtom';
import { clusterState } from 'state/clusterAtom';
import jsyaml from 'js-yaml';
import { atom, RecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import {
  permissionSetsSelector,
  PermissionSetState,
} from './permissionSetsSelector';
import { useUrl } from 'hooks/useUrl';
import { ConfigMapResponse, getConfigMaps } from './utils/getConfigMaps';
import { getFetchFn } from './utils/getFetchFn';
import { JSONSchema4 } from 'json-schema';
import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';

type Rule = {
  uniqueName: string;
  messageOnFailure?: string;
  documentationUrl?: string;
  category?: string;
  policies?: ValidationPolicy[];
  schema: JSONSchema4;
};

type ValidationConfig = {
  rules?: Array<Rule>;
  policies?: Array<ValidationPolicy>;
};

export type ValidationSchema = {
  rules: Array<Rule>;
  policies: Array<ValidationPolicy>;
};

export const emptyValidationSchema: ValidationSchema = {
  rules: [],
  policies: [],
};

type RuleReference =
  | string
  | {
      identifier: string;
    };

type ValidationPolicy = {
  name: string;
  enabled: boolean;
  includes: Array<string>;
  rules: Array<RuleReference>;
};

const fetchBaseValidationConfig = async (): Promise<ValidationConfig[]> => {
  try {
    const response = await fetch(`/resource-validation/rule-set.yaml`);
    const text = await response.text();
    return jsyaml.loadAll(text) as ValidationConfig[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const loadYamlValues = (
  configMaps: ConfigMapResponse[] | null,
): ValidationConfig[] => {
  return (configMaps
    ?.flatMap(configMap => Object.values(configMap.data))
    .flatMap(schemaText => jsyaml.loadAll(schemaText)) ??
    []) as ValidationConfig[];
};

const fetchConfigMapValidationConfigs = async (
  fetchFn: FetchFn | undefined,
  kubeconfigNamespace = 'kube-public',
  namespace: string,
  permissionSet: PermissionSetState,
): Promise<ValidationConfig[]> => {
  const configMaps = await getConfigMaps(
    fetchFn,
    kubeconfigNamespace,
    namespace,
    permissionSet,
    `busola.io/resource-validation=rule-set`,
  );

  const configFromConfigMap = loadYamlValues(configMaps) as Array<
    ValidationConfig
  >;
  return configFromConfigMap;
};

const fetchValidationConfig = async (
  fetchFn: FetchFn | undefined,
  kubeconfigNamespace = 'kube-public',
  namespace: string,
  permissionSet: PermissionSetState,
) => {
  const validationConfig = await fetchBaseValidationConfig();
  const configFromConfigMap = await fetchConfigMapValidationConfigs(
    fetchFn,
    kubeconfigNamespace,
    namespace,
    permissionSet,
  );

  const rules = [...validationConfig, ...configFromConfigMap].flatMap(
    schema => schema.rules ?? [],
  );

  const policies = [...validationConfig, ...configFromConfigMap].flatMap(
    schema => schema.policies ?? [],
  );

  return { rules, policies };
};

const getRuleKey = (rule: RuleReference) => {
  return typeof rule === 'string' ? rule : rule.identifier;
};

const resolveRulesForPolicy = (
  policy: ValidationPolicy,
  policyMap: Map<string, ValidationPolicy>,
  included: Set<string> = new Set(), // avoid circular dependencies
  includedRuleKeys: Set<string> = new Set(), // avoid duplicate rules
): RuleReference[] => {
  const rules = policy.rules.filter(rule => {
    const key = getRuleKey(rule);
    if (!includedRuleKeys.has(key)) {
      includedRuleKeys.add(key);
      return true;
    } else return false;
  });

  const additionalRules =
    policy.includes?.flatMap(name => {
      if (included.has(name)) return [];
      included.add(name);

      const includedPolicy = policyMap.get(name);
      if (includedPolicy) {
        return resolveRulesForPolicy(
          includedPolicy,
          policyMap,
          included,
          includedRuleKeys,
        );
      } else return [];
    }) ?? [];

  return [...rules, ...additionalRules];
};

export const getEnabledRules = (
  rules: Rule[],
  selectedPolicies: ValidationPolicy[],
  allPolicies?: ValidationPolicy[],
) => {
  const rulesByName = rules.reduce(
    (agg, rule) => ({ ...agg, [rule.uniqueName]: rule }),
    {},
  ) as { [key: string]: Rule };

  const policyMap =
    allPolicies?.reduce((agg, policy) => {
      return agg.set(policy.name, policy);
    }, new Map()) ?? (new Map() as Map<string, ValidationPolicy>);

  const enabledRulesByName = selectedPolicies.reduce((agg, policy) => {
    const policyRules = resolveRulesForPolicy(policy, policyMap);
    policyRules.forEach(rule => {
      const key = getRuleKey(rule);
      if (key) {
        if (agg[key]) {
          agg[key].policies?.push(policy);
        } else {
          agg[key] = {
            ...rulesByName[key],
            policies: [policy],
          };
        }
      }
    });
    return agg;
  }, {} as { [key: string]: Rule });

  const enabledRules = Object.values(enabledRulesByName);

  return enabledRules;
};

export const useGetValidationSchemas = async () => {
  const setSchemas = useSetRecoilState(validationSchemasState);
  const fetchFn = getFetchFn(useRecoilValue);
  const cluster = useRecoilValue(clusterState);
  const auth = useRecoilValue(authDataState);
  const permissionSet = useRecoilValue(permissionSetsSelector);
  const { namespace } = useUrl();

  useEffect(() => {
    const setValidationSchema = async () => {
      if (!cluster) {
        setSchemas(emptyValidationSchema);
      } else {
        const { rules, policies } = await fetchValidationConfig(
          fetchFn,
          cluster.currentContext.namespace,
          namespace,
          permissionSet,
        );

        setSchemas({
          rules,
          policies,
        });
      }
    };
    setValidationSchema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, auth, permissionSet, namespace]);
};

export const validationSchemasState: RecoilState<ValidationSchema | null> = atom<ValidationSchema | null>(
  {
    key: 'validationSchemasState',
    default: emptyValidationSchema,
  },
);
