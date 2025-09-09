import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { clusterAtom } from 'state/clusterAtom';

export type ExpandedCategories = string[];

type StoredExpandedCategories = {
  [clusterName: string]: {
    namespaced?: ExpandedCategories;
    cluster?: ExpandedCategories;
  };
};

const EXPANDED_CATEGORIES_STORAGE_KEY = 'busola.expanded-categories';
const defaultValue: StoredExpandedCategories = {};

const expandedCategoriesStorage = atomWithStorage<StoredExpandedCategories>(
  EXPANDED_CATEGORIES_STORAGE_KEY,
  defaultValue,
);

export const expandedCategoriesAtom = atom<
  ExpandedCategories,
  [ExpandedCategories],
  void
>(
  (get) => {
    const expandedCategories = get(expandedCategoriesStorage);
    const cluster = get(clusterAtom);
    const clusterName = cluster?.name || '';
    const scope = get(activeNamespaceIdAtom) ? 'namespaced' : 'cluster';

    return expandedCategories[clusterName]?.[scope] || [];
  },
  (get, set, newValue) => {
    const expandedCategories = { ...get(expandedCategoriesStorage) };
    const cluster = get(clusterAtom);
    const clusterName = cluster?.name || '';
    const scope = get(activeNamespaceIdAtom) ? 'namespaced' : 'cluster';

    expandedCategories[clusterName] = {
      ...expandedCategories[clusterName],
      [scope]: newValue,
    };

    set(expandedCategoriesStorage, expandedCategories);
  },
);
expandedCategoriesAtom.debugLabel = 'expandedCategoriesAtom';
