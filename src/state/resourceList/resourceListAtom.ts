import { atom } from 'jotai';
import { resources } from 'resources';
import { NavNode } from '../types';
import { mapBusolaResourceToNavNode } from './mapBusolaResourceToNavNode';

export const resourceListAtom = atom<NavNode[]>(
  resources.map(mapBusolaResourceToNavNode),
);
resourceListAtom.debugLabel = 'resourceListAtom';
