import { atom } from 'jotai';
import { openapiState } from './openapiAtom';

export const openapiPathIdListState = atom<string[]>(get => {
  const openApiLoadable = get(openapiState);
  if (openApiLoadable.state === 'hasData') {
    return Object.keys(openApiLoadable.data?.paths ?? {});
  }
  return [];
});
