import jsyaml from 'js-yaml';
import { atom, RecoilState, useSetRecoilState } from 'recoil';

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
};

export const extensibilitySchemasState: RecoilState<ExtensiblitySchemas> = atom<
  ExtensiblitySchemas
>({
  key: 'extensibilitySchemasState',
  default: {},
});
