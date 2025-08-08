import { atom } from 'jotai';

export type ManualKubeConfigIdType = {
  formOpen: boolean;
  auth: any;
};

const defaultValue = { formOpen: false, auth: null };

export const manualKubeConfigIdState = atom<ManualKubeConfigIdType>(
  defaultValue,
);

manualKubeConfigIdState.debugLabel = 'manualKubeConfigIdState';
