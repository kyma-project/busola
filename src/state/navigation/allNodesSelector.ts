import { RecoilValueReadOnly, selector } from 'recoil';

import { NavNode } from '../types';

import { mergeInExtensibilityNav } from './sidebarNavigationNodesSelector';
import { clusterAndNsNodesSelector } from './clusterAndNsNodesSelector';
import { configurationAtom } from '../configuration/configurationAtom';
import { extensionsState } from './extensionsAtom';
import { mapExtResourceToNavNode } from '../resourceList/mapExtResourceToNavNode';

export const allNodesSelector: RecoilValueReadOnly<NavNode[]> = selector<
  NavNode[]
>({
  key: 'allNodeSelector',
  get: ({ get }) => {
    const navNodes: NavNode[] = get(clusterAndNsNodesSelector);
    const configuration = get(configurationAtom);
    const features = configuration?.features;

    if (!navNodes) {
      return [];
    }
    let allNodes: NavNode[] = [];

    let extResources = get(extensionsState);

    const isExtensibilityOn = features?.EXTENSIBILITY?.isEnabled;
    if (isExtensibilityOn && extResources) {
      const extNavNodes = extResources.map(ext => mapExtResourceToNavNode(ext));
      allNodes = mergeInExtensibilityNav(navNodes, extNavNodes);
    }

    return allNodes;
  },
});
