import { atom } from 'jotai';

import { configFeaturesNames, NavNode } from '../types';

import { clusterAndNsNodesAtom } from './clusterAndNsNodesAtom';
import { configurationAtom } from '../configuration/configurationAtom';
import { extensionsAtom } from './extensionsAtom';
import { mapExtResourceToNavNode } from '../resourceList/mapExtResourceToNavNode';
import { mergeInExtensibilityNav } from './sidebarNavigationNodesAtom';

export const availableNodesAtom = atom<Promise<NavNode[]>>(async (get) => {
  const navNodes: NavNode[] = await get(clusterAndNsNodesAtom);
  const configuration = get(configurationAtom);
  const features = configuration?.features;

  const extResources = get(extensionsAtom);

  let extensibilityNodes: NavNode[] = [];
  const isExtensibilityOn =
    features?.[configFeaturesNames.EXTENSIBILITY]?.isEnabled;
  if (isExtensibilityOn && extResources) {
    const extNavNodes = extResources?.map((ext) =>
      mapExtResourceToNavNode(ext),
    );
    extensibilityNodes = mergeInExtensibilityNav(navNodes, extNavNodes);
  }

  return [...navNodes, ...extensibilityNodes];
});
availableNodesAtom.debugLabel = 'availableNodesAtom';
