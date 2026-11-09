import { useEffect } from 'react';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';
import jsyaml from 'js-yaml';

type ExtensibilitySchema = any;
interface ExtensiblitySchemas {
  [key: string]: ExtensibilitySchema;
}

const getSchema = async (
  schema: string,
  signal?: AbortSignal,
): Promise<ExtensibilitySchema> => {
  const cacheBuster = 'cache-buster=' + Date.now();
  const response = await fetch(
    `/schemas/schema-${schema}.yaml?${cacheBuster}`,
    {
      signal,
    },
  );
  const text = await response.text();
  return jsyaml.load(text);
};

export const useGetExtensibilitySchemas = () => {
  const setSchemas = useSetAtom(extensibilitySchemasAtom);
  const cluster = useAtomValue(clusterAtom);
  const auth = useAtomValue(authDataAtom);

  useEffect(() => {
    if (!cluster) {
      setSchemas(null);
      return;
    }

    const controller = new AbortController();
    const setExtensionsSchema = async () => {
      try {
        const { signal } = controller;
        const details = await getSchema('details', signal);
        const list = await getSchema('list', signal);
        const general = await getSchema('general', signal);
        const form = await getSchema('form', signal);
        // const dataSources = await getSchema('dataSources', signal);

        setSchemas({
          details,
          list,
          general,
          form,
          // dataSources,
        });
      } catch (e) {
        // abort is fine, this happens when cluster/auth changes or we clean up mid-fetch
        if ((e as Error)?.name === 'AbortError') return;
        // a failed fetch shouldn't bubble up as an unhandled rejection, just warn and move on
        console.warn('Cannot load extensibility schemas', e);
      }
    };
    setExtensionsSchema();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, auth]);
};

export const extensibilitySchemasAtom = atom<ExtensiblitySchemas | null>({});
extensibilitySchemasAtom.debugLabel = 'extensibilitySchemasAtom';
