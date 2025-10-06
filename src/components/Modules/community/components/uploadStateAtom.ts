import { atom } from 'jotai/index';

export enum State {
  Downloading = 'Downloading',
  Uploading = 'Uploading',
  Finished = 'Finished',
  Error = 'Error',
}

export type UploadState = {
  moduleName: string;
  state: State;
  message: string;
};
const defaultValue: UploadState[] = [];

export const uploadStateAtom = atom<UploadState[]>(defaultValue);
uploadStateAtom.debugLabel = 'uploadState';
