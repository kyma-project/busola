import { RecoilValueReadOnly, selector } from 'recoil';
import { assignNodesToCategories } from './assignToCategories';
import { Category } from './categories';
import { NavNode, Scope } from '../types';
import { clusterAndNsNodesSelector } from './clusterAndNsNodesSelector';
import { externalNodesSelector } from './externalNodesSelector';
import {
  activeNamespaceIdState,
  defaultValue as defaultNamespaceName,
} from '../activeNamespaceIdAtom';
import { hasCurrentScope } from './filters/hasCurrentScope';
import { partial } from 'lodash';

export const sidebarNavigationNodesSelector: RecoilValueReadOnly<Category[]> = selector<
  Category[]
>({
  key: 'scopedNavigationSelector',
  get: ({ get }) => {
    const navNodes: NavNode[] = get(clusterAndNsNodesSelector);
    const activeNamespaceId = get(activeNamespaceIdState);
    const observabilityNodes = get(externalNodesSelector);

    const scope: Scope = activeNamespaceId ? 'namespace' : 'cluster';

    if (
      !navNodes ||
      !observabilityNodes ||
      activeNamespaceId === defaultNamespaceName
    ) {
      return [];
    }
    const navAndObservabilityNodes = [...navNodes, ...observabilityNodes];

    const nodesFromCurrentScope = partial(hasCurrentScope, scope);
    const filteredNodes = navAndObservabilityNodes.filter(
      nodesFromCurrentScope,
    );

    const assignedToCategories: Category[] = assignNodesToCategories(
      filteredNodes,
    );

    return assignedToCategories;
  },
});
