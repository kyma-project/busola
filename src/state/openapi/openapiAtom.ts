import { atom } from 'jotai';
import { getFetchFn } from 'state/utils/getFetchFn';

type OpenapiState = {
  swagger: string;
  paths: Record<string, any>;
  error: true | undefined;
} | null;

export const openapiState = atom<Promise<OpenapiState>>(async get => {
  const fetchFn = getFetchFn(get);
  if (!fetchFn) return null;

  const response = await fetchFn({ relativeUrl: '/openapi/v2' });
  const json = await response.json();
  return json;
});
openapiState.debugLabel = 'openapiState';
