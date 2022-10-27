import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../utils/effects';

type ExpandedCategoriesAtom = string[] | null;

const EXPANDED_CATEGORIES_STORAGE_KEY = 'busola.expanded-categories';
const defaultValue: ExpandedCategoriesAtom = [];

export const expandedCategoriesState: RecoilState<ExpandedCategoriesAtom> = atom<
  ExpandedCategoriesAtom
>({
  key: 'expandedCategoriesState',
  default: defaultValue,
  effects: [
    localStorageEffect<ExpandedCategoriesAtom>(EXPANDED_CATEGORIES_STORAGE_KEY),
  ],
});
