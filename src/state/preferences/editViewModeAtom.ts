import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../utils/effects';

export type EditViewTypes = {
  preferencesViewType: 'MODE_YAML' | 'MODE_FORM' | 'MODE_DEFAULT' | string;
  dynamicViewType: 'MODE_YAML' | 'MODE_FORM' | null;
};

export type EditViewMode = string | EditViewTypes;

const EDIT_VIEW_MODE_STORAGE_KEY = 'busola.editViewMode';
const DEFAULT_EDIT_VIEW_MODE = 'MODE_DEFAULT';

export const editViewModeState: RecoilState<EditViewMode> = atom<EditViewMode>({
  key: 'editViewModeState',
  default: DEFAULT_EDIT_VIEW_MODE,
  effects: [localStorageEffect<EditViewMode>(EDIT_VIEW_MODE_STORAGE_KEY)],
});

export const getEditViewModeState = (editView: EditViewMode): EditViewTypes => {
  if (typeof editView === 'string') {
    return {
      preferencesViewType: 'MODE_DEFAULT',
      dynamicViewType: 'MODE_FORM',
    };
  } else {
    return editView;
  }
};
