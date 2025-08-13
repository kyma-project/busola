import { atom } from 'jotai';

export const defaultValue = null;

export const openapiLastFetchedState = atom<string | null>(defaultValue);

openapiLastFetchedState.debugLabel = 'openapiLastFetchedState';
