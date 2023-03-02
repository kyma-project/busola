import { useEffect } from 'react';
import { authDataState } from 'state/authDataAtom';
import { clusterState } from 'state/clusterAtom';
import jsyaml from 'js-yaml';
import { atom, RecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import { permissionSetsSelector } from './permissionSetsSelector';
import { useUrl } from 'hooks/useUrl';
import { getConfigMaps } from './utils/getConfigMaps';
import { getFetchFn } from './utils/getFetchFn';
import { JSONSchema4 } from 'json-schema';

type ValidationSchema = any;
interface ValidationSchemas {
  [key: string]: ValidationSchema;
}

interface Rule {
  uniqueName: string;
  schema: JSONSchema4;
}

interface RuleSchema {
  rules: Array<Rule>;
}

const getSchema = async (): Promise<RuleSchema> => {
  const response = await fetch(`/validation/defaultRules.yaml`);
  const text = await response.text();
  return jsyaml.load(text) as RuleSchema;
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

        const [ruleMaps, schemaMaps] = await Promise.all(
          ['validation-rules', 'validation-schema'].map(type =>
            getConfigMaps(
              fetchFn,
              cluster.currentContext.namespace,
              namespace,
              permissionSet,
              `busola.io/config=${type}`,
            ),
          ),
        );

        const schemasFromConfigMap = (schemaMaps
          ?.flatMap(configMap => Object.values(configMap.data))
          .map(schemaText => jsyaml.load(schemaText)) ?? []) as Array<
          RuleSchema
        >;

        // const rulesFromConfigMap = ruleMaps?.flatMap(configMap => Object.values(configMap.data))
        //   .map(ruleText => jsyaml.load(ruleText));

        const rules = [
          ...schemasFromConfigMap.map((schema: { rules: any }) => schema.rules),
          ...defaultSchema.rules,
        ];

        setSchemas({
          rules,
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
