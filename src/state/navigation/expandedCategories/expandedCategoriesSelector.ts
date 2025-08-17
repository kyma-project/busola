import { atom } from 'jotai';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clusterState } from 'state/clusterAtom';
import {
  ExpandedCategories,
  expandedCategoriesState,
} from './expandedCategoriesAtom';

export const expandedCategoriesSelector = atom<
  ExpandedCategories,
  [ExpandedCategories],
  void
>(
  get => {
    const expandedCategories = get(expandedCategoriesState);
    const cluster = get(clusterState);
    const clusterName = cluster?.name || '';
    const scope = get(activeNamespaceIdState) ? 'namespaced' : 'cluster';

    return expandedCategories[clusterName]?.[scope] || [];
  },
  (get, set, newValue) => {
    const expandedCategories = { ...get(expandedCategoriesState) };
    const cluster = get(clusterState);
    const clusterName = cluster?.name || '';
    const scope = get(activeNamespaceIdState) ? 'namespaced' : 'cluster';

    expandedCategories[clusterName] = {
      ...expandedCategories[clusterName],
      [scope]: newValue,
    };

    set(expandedCategoriesState, expandedCategories);
  },
);
expandedCategoriesSelector.debugLabel = 'expandedCategoriesSelector';
