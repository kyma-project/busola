import { atom } from 'jotai';

const DEFAULT_SHOW_YAML_UPLOAOD_DIALOG = false;

export const showYamlUploadDialogState = atom<boolean>(
  DEFAULT_SHOW_YAML_UPLOAOD_DIALOG,
);
showYamlUploadDialogState.debugLabel = 'showYamlUploadDialogState';
