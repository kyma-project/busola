import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../../utils/effects';

export type ExpandedCategories = string[];

type StoredExpandedCategories = {
  [clusterName: string]: {
    namespaced?: ExpandedCategories;
    cluster?: ExpandedCategories;
  };
};

const EXPANDED_CATEGORIES_STORAGE_KEY = 'busola.expanded-categories';
const defaultValue: StoredExpandedCategories = {};

export const expandedCategoriesState: RecoilState<StoredExpandedCategories> = atom<
  StoredExpandedCategories
>({
  key: 'expandedCategoriesState',
  default: defaultValue,
  effects: [
    localStorageEffect<StoredExpandedCategories>(
      EXPANDED_CATEGORIES_STORAGE_KEY,
    ),
  ],
});
