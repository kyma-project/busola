import { atom } from 'jotai';

export interface IsFormOpenState {
  formOpen: boolean;
  leavingForm: boolean;
}

const defaultValue = { formOpen: false, leavingForm: false };

export const isFormOpenAtom = atom<IsFormOpenState>(defaultValue);
isFormOpenAtom.debugLabel = 'isFormOpenAtom';
