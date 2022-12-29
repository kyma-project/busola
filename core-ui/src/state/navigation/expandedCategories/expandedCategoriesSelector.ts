import { DefaultValue, RecoilState, selector } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clusterState } from 'state/clusterAtom';
import {
  ExpandedCategories,
  expandedCategoriesState,
} from './expandedCategoriesAtom';

export const expandedCategoriesSelector: RecoilState<ExpandedCategories> = selector<
  ExpandedCategories
>({
  key: 'expandedCategoriesSelector',
  get: ({ get }) => {
    const expandedCategories = get(expandedCategoriesState);
    const cluster = get(clusterState);
    const clusterName = cluster?.name || '';
    const scope = get(activeNamespaceIdState) ? 'namespaced' : 'cluster';

    return expandedCategories[clusterName]?.[scope] || [];
  },
  set: ({ get, set }, newValue) => {
    const expandedCategories = { ...get(expandedCategoriesState) };
    const cluster = get(clusterState);
    const clusterName = cluster?.name || '';

    if (!(newValue instanceof DefaultValue)) {
      const scope = get(activeNamespaceIdState) ? 'namespaced' : 'cluster';
      expandedCategories[clusterName] = {
        ...expandedCategories[clusterName],
        [scope]: newValue,
      };
    }

    set(expandedCategoriesState, expandedCategories);
  },
});
