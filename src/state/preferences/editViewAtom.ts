import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../utils/effects';

export type EditViewTypes = {
  preferencesViewType: 'MODE_YAML' | 'MODE_FORM' | 'MODE_DEFAULT' | string;
  dynamicViewType: 'MODE_YAML' | 'MODE_FORM' | null;
};

export type EditView = string | EditViewTypes;

const EDIT_VIEW_STORAGE_KEY = 'busola.editView';
const DEFAULT_EDIT_VIEW = 'MODE_DEFAULT';

export const editViewState: RecoilState<EditView> = atom<EditView>({
  key: 'editViewState',
  default: DEFAULT_EDIT_VIEW,
  effects: [localStorageEffect<EditView>(EDIT_VIEW_STORAGE_KEY)],
});

export const getEditViewState = (editView: EditView): EditViewTypes => {
  if (typeof editView === 'string') {
    return {
      preferencesViewType: 'MODE_DEFAULT',
      dynamicViewType: 'MODE_FORM',
    };
  } else {
    return editView;
  }
};
