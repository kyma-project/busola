import { atomWithStorage } from 'jotai/utils';

export type ExpandedCategories = string[];

type StoredExpandedCategories = {
  [clusterName: string]: {
    namespaced?: ExpandedCategories;
    cluster?: ExpandedCategories;
  };
};

const EXPANDED_CATEGORIES_STORAGE_KEY = 'busola.expanded-categories';
const defaultValue: StoredExpandedCategories = {};

export const expandedCategoriesState = atomWithStorage<
  StoredExpandedCategories
>(EXPANDED_CATEGORIES_STORAGE_KEY, defaultValue);
expandedCategoriesState.debugLabel = 'expandedCategoriesState';
