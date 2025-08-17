import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { openapiState } from './openapiAtom';

export const openapiPathIdListState = atom<string[]>(get => {
  const openApiLoadable = get(loadable(openapiState));
  if (openApiLoadable.state === 'hasData') {
    return Object.keys(openApiLoadable.data?.paths ?? {});
  }
  return [];
});
