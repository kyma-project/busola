import { atom } from 'jotai';
import { openapiAtom } from './openapiAtom';

export const openapiPathIdListAtom = atom<string[]>((get) => {
  const openApiLoadable = get(openapiAtom);
  if (openApiLoadable.state === 'hasData') {
    return Object.keys(openApiLoadable.data?.paths ?? {});
  }
  return [];
});
openapiPathIdListAtom.debugLabel = 'openapiPathIdListAtom';
