import { RecoilValueReadOnly, selector } from 'recoil';
import { assignNodesToCategories } from './assignToCategories';
import { Category } from './categories';
import { NavNode, Scope } from '../types';
import { clusterAndNsNodesSelector } from './clusterAndNsNodesSelector';
import { observabilityNodesSelector } from './observabilityNodesSelector';
import {
  activeNamespaceIdState,
  defaultValue as defaultNamespaceName,
} from '../activeNamespaceIdAtom';
import { hasCurrentScope } from './filters/hasCurrentScope';
import { partial } from 'lodash';
import { observabilityNodesSelector } from './observabilityNodesSelector';

export const sidebarNavigationNodesSelector: RecoilValueReadOnly<Category[]> = selector<
  Category[]
>({
  key: 'scopedNavigationSelector',
  get: ({ get }) => {
    const navNodes: NavNode[] = get(clusterAndNsNodesSelector);
    const activeNamespaceId = get(activeNamespaceIdState);
    const observabilityNodes = get(observabilityNodesSelector);

    const scope: Scope = activeNamespaceId ? 'namespace' : 'cluster';

    if (
      !navNodes ||
      !observabilityNodes ||
      activeNamespaceId === defaultNamespaceName ||
      !observabilityNodes
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
