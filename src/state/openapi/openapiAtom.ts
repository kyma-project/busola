import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { getFetchFn } from 'state/utils/getFetchFn';

type OpenapiState = {
  swagger: string;
  paths: Record<string, any>;
  error: true | undefined;
} | null;

const asyncOpenapiState = atom<Promise<OpenapiState>>(async get => {
  const fetchFn = getFetchFn(get);
  if (!fetchFn) return null;
  const response = await fetchFn({ relativeUrl: '/openapi/v2' });
  const json = await response.json();
  return json;
});
asyncOpenapiState.debugLabel = 'openapiState';

export const openapiState = loadable(asyncOpenapiState);
