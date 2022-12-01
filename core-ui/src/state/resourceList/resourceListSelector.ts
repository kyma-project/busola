import { selector } from 'recoil';
import { resources } from 'resources';
import { NavNode } from '../types';
import { mapBusolaResourceToNavNode } from './mapBusolaResourceToNavNode';

export const resourceListSelector = selector<NavNode[]>({
  key: 'resourceListSelector',
  get: () => {
    const resNodeList: NavNode[] = resources.map(mapBusolaResourceToNavNode);
    return resNodeList;
  },
});
