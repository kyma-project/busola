import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../utils/effects';

export type EditViewTypes = {
  preferencesViewType: 'YAML' | 'form' | 'auto' | string;
  dynamicViewType: 'YAML' | 'form' | null | string;
};

export type EditView = string | EditViewTypes;

const EDIT_VIEW_STORAGE_KEY = 'busola.editView';
const DEFAULT_EDIT_VIEW = 'auto';

export const editViewState: RecoilState<EditView> = atom<EditView>({
  key: 'editViewState',
  default: DEFAULT_EDIT_VIEW,
  effects: [localStorageEffect<EditView>(EDIT_VIEW_STORAGE_KEY)],
});

export const getEditViewState = (editView: EditView): EditViewTypes => {
  console.log(editView);
  if (typeof editView === 'string') {
    return {
      preferencesViewType: 'auto',
      dynamicViewType: 'MODE_FORM',
    };
  } else {
    return editView;
  }
};
