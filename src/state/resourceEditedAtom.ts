import { atom } from 'jotai';

export interface IsResourceEditedState {
  isEdited: boolean;
  discardAction?: Function;
}

const defaultValue = { isEdited: false };

export const isResourceEditedState = atom<IsResourceEditedState>(defaultValue);
