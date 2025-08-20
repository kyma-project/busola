import { atom } from 'jotai';

const defaultValue = null;

export const openapiLastFetchedAtom = atom<string | null>(defaultValue);
openapiLastFetchedAtom.debugLabel = 'openapiLastFetchedAtom';
