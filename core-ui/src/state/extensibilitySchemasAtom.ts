import { useEffect } from 'react';
import { authDataState } from 'state/authDataAtom';
import { clusterState } from 'state/clusterAtom';
import jsyaml from 'js-yaml';
import { atom, RecoilState, useSetRecoilState, useRecoilValue } from 'recoil';

type ExtensibilitySchema = any;
interface ExtensiblitySchemas {
  [key: string]: ExtensibilitySchema;
}

const getSchema = async (schema: string): Promise<ExtensibilitySchema> => {
  const cacheBuster = 'cache-buster=' + Date.now();
  const response = await fetch(`/schemas/schema-${schema}.yaml?${cacheBuster}`);
  const text = await response.text();
  return jsyaml.load(text);
};

export const useGetExtensibilitySchemas = async () => {
  const setSchemas = useSetRecoilState(extensibilitySchemasState);
  const cluster = useRecoilValue(clusterState);
  const auth = useRecoilValue(authDataState);

  useEffect(() => {
    const setCluster = async () => {
      if (!cluster) {
        setSchemas(null);
      } else {
        const details = await getSchema('details');
        const list = await getSchema('list');
        const general = await getSchema('general');
        const form = await getSchema('form');
        // const dataSources = await getSchema('dataSources');

        setSchemas({
          details,
          list,
          general,
          form,
          // dataSources,
        });
      }
    };
    setCluster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, auth]);
};

export const extensibilitySchemasState: RecoilState<ExtensiblitySchemas | null> = atom<ExtensiblitySchemas | null>(
  {
    key: 'extensibilitySchemasState',
    default: {},
  },
);
