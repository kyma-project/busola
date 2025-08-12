import { atom } from 'jotai';
import { K8sAPIResource } from 'types';

export type ResourcesState = K8sAPIResource[] | null;

const defaultValue: ResourcesState = null;

export const resourcesState = atom<ResourcesState>(defaultValue);

resourcesState.debugLabel = 'resourcesState';
