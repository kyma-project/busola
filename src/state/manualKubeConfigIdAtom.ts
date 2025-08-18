import { atom } from 'jotai';

export type ManualKubeConfigIdType = {
  formOpen: boolean;
  auth: any;
};

const defaultValue = { formOpen: false, auth: null };

export const manualKubeConfigIdAtom = atom<ManualKubeConfigIdType>(
  defaultValue,
);
manualKubeConfigIdAtom.debugLabel = 'manualKubeConfigIdAtom';
