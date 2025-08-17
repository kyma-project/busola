import { atom } from 'jotai';

const defaultValue: [] = [];

export const resourcesConditions = atom<[]>(defaultValue);
resourcesConditions.debugLabel = 'resourcesConditions';
