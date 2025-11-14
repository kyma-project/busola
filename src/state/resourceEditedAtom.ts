import { atom } from 'jotai';

export type DiscardFn = {};

export interface IsResourceEditedState {
  isEdited: boolean;
  discardAction?: DiscardFn;
}

const defaultValue = { isEdited: false };

export const isResourceEditedAtom = atom<IsResourceEditedState>(defaultValue);
isResourceEditedAtom.debugLabel = 'isResourceEditedAtom';
