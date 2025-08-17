import { atom } from 'jotai';

import { configFeaturesNames, NavNode } from '../types';

import { mergeInExtensibilityNav } from './sidebarNavigationNodesSelector';
import { clusterAndNsNodesSelector } from './clusterAndNsNodesSelector';
import { configurationState } from '../configuration/configurationAtom';
import { extensionsState } from './extensionsAtom';
import { mapExtResourceToNavNode } from '../resourceList/mapExtResourceToNavNode';

export const allNodesSelector = atom<Promise<NavNode[]>>(async get => {
  const navNodes: NavNode[] = await get(clusterAndNsNodesSelector);
  const configuration = get(configurationState);
  const features = configuration?.features;

  if (!navNodes) {
    return [];
  }
  let allNodes: NavNode[] = [];

  let extResources = get(extensionsState);

  const isExtensibilityOn =
    features?.[configFeaturesNames.EXTENSIBILITY]?.isEnabled;
  if (isExtensibilityOn && extResources) {
    const extNavNodes = extResources.map(ext => mapExtResourceToNavNode(ext));
    allNodes = mergeInExtensibilityNav(navNodes, extNavNodes);
  }

  return allNodes;
});
allNodesSelector.debugLabel = 'allNodesSelector';
