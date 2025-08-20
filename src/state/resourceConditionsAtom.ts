import { atom } from 'jotai';

const defaultValue: [] = [];

export const resourcesConditionsAtom = atom<[]>(defaultValue);
resourcesConditionsAtom.debugLabel = 'resourcesConditionsAtom';
