import { atom } from 'jotai';

import { configFeaturesNames, NavNode } from '../types';

import { mergeInExtensibilityNav } from './sidebarNavigationNodesAtom';
import { clusterAndNsNodesAtom } from './clusterAndNsNodesAtom';
import { configurationAtom } from '../configuration/configurationAtom';
import { extensionsAtom } from './extensionsAtom';
import { mapExtResourceToNavNode } from '../resourceList/mapExtResourceToNavNode';

export const allNodesAtom = atom<Promise<NavNode[]>>(async (get) => {
  const navNodes: NavNode[] = await get(clusterAndNsNodesAtom);
  const configuration = get(configurationAtom);
  const features = configuration?.features;

  if (!navNodes) {
    return [];
  }
  let allNodes: NavNode[] = [];

  let extResources = get(extensionsAtom);

  const isExtensibilityOn =
    features?.[configFeaturesNames.EXTENSIBILITY]?.isEnabled;
  if (isExtensibilityOn && extResources) {
    const extNavNodes = extResources.map((ext) => mapExtResourceToNavNode(ext));
    allNodes = mergeInExtensibilityNav(navNodes, extNavNodes);
  }

  return allNodes;
});
allNodesAtom.debugLabel = 'allNodesAtom';
