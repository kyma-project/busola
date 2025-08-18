import { atom } from 'jotai';

export interface IsResourceEditedState {
  isEdited: boolean;
  discardAction?: Function;
}

const defaultValue = { isEdited: false };

export const isResourceEditedAtom = atom<IsResourceEditedState>(defaultValue);
isResourceEditedAtom.debugLabel = 'isResourceEditedAtom';
