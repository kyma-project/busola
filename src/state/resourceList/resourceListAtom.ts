import { atom } from 'jotai';
import { resources } from 'resources';
import { NavNode } from '../types';
import { mapBusolaResourceToNavNode } from './mapBusolaResourceToNavNode';

export const resourceListState = atom<NavNode[]>(
  resources.map(mapBusolaResourceToNavNode),
);
resourceListState.debugLabel = 'resourceListState';
