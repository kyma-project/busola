import { atom, SetStateAction } from 'jotai';

export type ManualKubeConfigIdType = {
  formOpen: boolean;
  auth: any;
};

export type ManualKubeConfigIdController = {
  manualKubeConfigId?: ManualKubeConfigIdType;
  setManualKubeConfigId?: (
    update: SetStateAction<ManualKubeConfigIdType>,
  ) => void;
};

const defaultValue = { formOpen: false, auth: null };

export const manualKubeConfigIdAtom =
  atom<ManualKubeConfigIdType>(defaultValue);
manualKubeConfigIdAtom.debugLabel = 'manualKubeConfigIdAtom';
