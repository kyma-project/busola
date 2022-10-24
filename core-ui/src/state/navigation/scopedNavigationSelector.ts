import { RecoilValueReadOnly, selector } from 'recoil';
import { assignNodesToCategories } from './assignToCategories';
import { Category } from './categories';
import { NavNode, Scope } from '../types';
import { navigationNodesSelector } from './navigationNodesSelector';
import {
  activeNamespaceIdState,
  defaultValue as defaultNamespaceName,
} from '../activeNamespaceIdAtom';
import { hasCurrentScope } from './filters/hasCurrentScope';
import { partial } from 'lodash';

export const scopedNavigationSelector: RecoilValueReadOnly<Category[]> = selector<
  Category[]
>({
  key: 'scopedNavigationSelector',
  get: async ({ get }) => {
    const navNodes: NavNode[] = get(navigationNodesSelector);
    const activeNamespaceId = get(activeNamespaceIdState);
    const scope: Scope = activeNamespaceId ? 'namespace' : 'cluster';

    if (!navNodes || activeNamespaceId === defaultNamespaceName) {
      return [];
    }

    const nodesFromCurrentScope = partial(hasCurrentScope, scope);
    const filteredNodes = navNodes.filter(nodesFromCurrentScope);

    const assignedToCategories: Category[] = assignNodesToCategories(
      filteredNodes,
    );

    return assignedToCategories;
  },
});
