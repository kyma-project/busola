import { atom } from 'jotai/index';

// TODO: use trasnlation
export enum State {
  Downloading = 'Downloading',
  Preparing = 'Preparing',
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
