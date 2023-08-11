import { atom, RecoilState } from 'recoil';
import { K8sAPIResource } from 'types';

export type ResourcesState = K8sAPIResource[] | null;

const defaultValue: ResourcesState = null;

export const resourcesState: RecoilState<ResourcesState> = atom<ResourcesState>(
  {
    key: 'resourcesState',
    default: defaultValue,
  },
);
