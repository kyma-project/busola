import { RecoilValueReadOnly, selector } from 'recoil';

import { NavNode } from '../types';

import { clusterAndNsNodesSelector } from './clusterAndNsNodesSelector';
import { configurationAtom } from '../configuration/configurationAtom';
import { extensionsState } from './extensionsAtom';
import { mapExtResourceToNavNode } from '../resourceList/mapExtResourceToNavNode';
import { mergeInExtensibilityNav } from './sidebarNavigationNodesSelector';

export const availableNodesSelector: RecoilValueReadOnly<NavNode[]> = selector<
  NavNode[]
>({
  key: 'availableNodesSelector',
  get: ({ get }) => {
    const navNodes: NavNode[] = get(clusterAndNsNodesSelector);
    const configuration = get(configurationAtom);
    const features = configuration?.features;

    const extResources = get(extensionsState);

    let extensibilityNodes: NavNode[] = [];
    const isExtensibilityOn = features?.EXTENSIBILITY?.isEnabled;
    if (isExtensibilityOn && extResources) {
      const extNavNodes = extResources?.map(ext =>
        mapExtResourceToNavNode(ext),
      );
      extensibilityNodes = mergeInExtensibilityNav(navNodes, extNavNodes);
    }

    return [...navNodes, ...extensibilityNodes];
  },
});
