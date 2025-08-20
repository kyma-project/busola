import { atom } from 'jotai';

const DEFAULT_SHOW_YAML_UPLOAOD_DIALOG = false;

export const showYamlUploadDialogAtom = atom<boolean>(
  DEFAULT_SHOW_YAML_UPLOAOD_DIALOG,
);
showYamlUploadDialogAtom.debugLabel = 'showYamlUploadDialogAtom';
