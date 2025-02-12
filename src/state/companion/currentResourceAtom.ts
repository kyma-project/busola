import { atom, RecoilState } from 'recoil';

export type CurrentResource = {
  namespace: string;
  resourceType: string;
  groupVersion: string;
  resourceName: string;
};

const DEFAULT_CURRENT_RESOURCE: CurrentResource = {
  namespace: '',
  resourceType: '',
  groupVersion: '',
  resourceName: '',
};

export const currentResourceState: RecoilState<CurrentResource> = atom<
  CurrentResource
>({
  key: 'currentResourceState',
  default: DEFAULT_CURRENT_RESOURCE,
});
