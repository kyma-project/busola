import { atom } from 'jotai';
import { unwrap } from 'jotai/utils';
import { getFetchFn } from 'state/utils/getFetchFn';

type OpenapiState = {
  swagger: string;
  paths: Record<string, any>;
  error: true | undefined;
} | null;

type OpenapiLoadable =
  | { state: 'loading' }
  | { state: 'hasData'; data: OpenapiState }
  | { state: 'hasError'; error: unknown };

const LOADING: OpenapiLoadable = { state: 'loading' };

// Resolves with the error instead of rejecting. jotai's `loadable`/`unwrap`
// re-subscribes to an already rejected promise when a superseded request
// settles afterwards (e.g. the SSO session drops mid-request), which never
// stops and freezes the tab.
const asyncOpenapiAtom = atom<Promise<OpenapiLoadable>>(async (get) => {
  try {
    const fetchFn = getFetchFn(get);
    if (!fetchFn) return { state: 'hasData', data: null };
    const response = await fetchFn({ relativeUrl: '/openapi/v2' });
    return { state: 'hasData', data: await response.json() };
  } catch (error) {
    return { state: 'hasError', error };
  }
});

export const openapiAtom = unwrap(asyncOpenapiAtom, () => LOADING);
openapiAtom.debugLabel = 'openapiAtom';
