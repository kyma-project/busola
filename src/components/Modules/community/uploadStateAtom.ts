import { useState } from 'react';
import { atom } from 'jotai/index';
import { IsResourceEditedState } from 'state/resourceEditedAtom';

export enum State {
  Downloading,
  Preparing,
  Uploading,
  Finished,
  Error,
}

export type UploadStateAtom = {
  state: State;
  message: string;
};
const defaultValue = null;

export const uploadStateAtom = atom<UploadStateAtom | null>(defaultValue);
uploadStateAtom.debugLabel = 'uploadState';
