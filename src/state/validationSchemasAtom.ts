import { useEffect } from 'react';
import { authDataState } from 'state/authDataAtom';
import { clusterState } from 'state/clusterAtom';
import jsyaml from 'js-yaml';
import { atom, RecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import { permissionSetsSelector } from './permissionSetsSelector';
import { useUrl } from 'hooks/useUrl';
import { ConfigMapResponse, getConfigMaps } from './utils/getConfigMaps';
import { getFetchFn } from './utils/getFetchFn';
import { JSONSchema4 } from 'json-schema';

type ValidationSchema = any;
interface ValidationSchemas {
  [key: string]: ValidationSchema;
}

interface Rule {
  uniqueName: string;
  policies?: ValidationPolicy[];
  schema: JSONSchema4;
}

interface RuleSchema {
  rules: Array<Rule>;
}

interface ValidationConfig {
  rules?: Array<Rule>;
  policies?: Array<ValidationPolicy>;
}

type RuleReference = {
  identifier: string;
};

type ValidationPolicy = {
  name: string;
  enabled: boolean;
  rules: Array<RuleReference>;
};

interface ValidationPolicies {
  policies: Array<ValidationPolicy>;
}

const getSchema = async (): Promise<RuleSchema> => {
  const response = await fetch(`/validation/rules.yaml`);
  const text = await response.text();
  return jsyaml.load(text) as RuleSchema;
};

const getPolicies = async (): Promise<ValidationPolicies> => {
  const response = await fetch(`/validation/rules.yaml`);
  const text = await response.text();
  return jsyaml.load(text) as ValidationPolicies;
};

const getConfig = async (): Promise<ValidationConfig | null> => {
  try {
    const response = await fetch(`/validation/config.yaml`);
    const text = await response.text();
    return jsyaml.load(text) as ValidationConfig;
  } catch (error) {
    console.error(error);
    return null;
  }
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
      console.log(`cluster: ${cluster}`);
      if (!cluster) {
        setSchemas({});
      } else {
        let defaultSchema = await getSchema();
        let defaultPolicies = await getPolicies();

        const validationConfig = await getConfig();

        const [schemaMaps, policyMaps] = await Promise.all(
          ['validation-schema', 'validation-policy'].map(type =>
            getConfigMaps(
              fetchFn,
              cluster.currentContext.namespace,
              namespace,
              permissionSet,
              `busola.io/validation-config=${type}`,
            ),
          ),
        );

        const loadYamlValues = (configMaps: ConfigMapResponse[] | null) => {
          return (
            configMaps
              ?.flatMap(configMap => Object.values(configMap.data))
              .map(schemaText => jsyaml.load(schemaText)) ?? []
          );
        };

        const schemasFromConfigMap = loadYamlValues(schemaMaps) as Array<
          RuleSchema
        >;
        const policiesFromConfigMap = loadYamlValues(policyMaps) as Array<
          ValidationPolicies
        >;

        // const rulesFromConfigMap = ruleMaps?.flatMap(configMap => Object.values(configMap.data))
        //   .map(ruleText => jsyaml.load(ruleText));

        const rules = [
          ...schemasFromConfigMap.flatMap(
            (schema: { rules: any }) => schema.rules,
          ),
          // ...defaultSchema?.rules ?? [],
          ...(validationConfig?.rules ?? []),
        ];
        console.log(validationConfig);

        const rulesByName = rules.reduce(
          (agg, rule) => ({ ...agg, [rule.uniqueName]: rule }),
          {},
        ) as { [key: string]: Rule };

        const policies = [
          ...policiesFromConfigMap.flatMap(schema => schema.policies),
          // ...defaultPolicies?.policies ?? [],
          ...(validationConfig?.policies ?? []),
        ];

        const enabledRulesByName = policies
          .filter(policy => policy.enabled)
          .reduce((agg, policy) => {
            policy.rules.forEach(rule => {
              if (rule.identifier) {
                const key = rule.identifier;

                if (agg[key]) {
                  agg[key].policies?.push(policy);
                } else {
                  agg[key] = {
                    ...rulesByName[rule.identifier],
                    policies: [policy],
                  };
                }
              }
            });
            return agg;
          }, {} as { [key: string]: Rule });

        const enabledRules = Object.values(enabledRulesByName);

        setSchemas({
          rules: enabledRules,
          rulesByName,
          policies,
          defaultSchema,
          schemasFromConfigMap,
        });
      }
    };
    setValidationSchema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, auth, permissionSet, namespace]);
};

export const validationSchemasState: RecoilState<ValidationSchemas | null> = atom<ValidationSchemas | null>(
  {
    key: 'validationSchemasState',
    default: {},
  },
);
