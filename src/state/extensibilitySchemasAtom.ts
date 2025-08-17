import { useEffect } from 'react';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { authDataState } from 'state/authDataAtom';
import { clusterState } from 'state/clusterAtom';
import jsyaml from 'js-yaml';

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
  const setSchemas = useSetAtom(extensibilitySchemasState);
  const cluster = useAtomValue(clusterState);
  const auth = useAtomValue(authDataState);

  useEffect(() => {
    const setExtensionsSchema = async () => {
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
    setExtensionsSchema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, auth]);
};

export const extensibilitySchemasState = atom<ExtensiblitySchemas | null>({});
extensibilitySchemasState.debugLabel = 'extensibilitySchemasState';
