import { atom } from 'jotai';

import { configFeaturesNames, NavNode } from '../types';

import { clusterAndNsNodesSelector } from './clusterAndNsNodesSelector';
import { configurationState } from '../configuration/configurationAtom';
import { extensionsState } from './extensionsAtom';
import { mapExtResourceToNavNode } from '../resourceList/mapExtResourceToNavNode';
import { mergeInExtensibilityNav } from './sidebarNavigationNodesSelector';

export const availableNodesSelector = atom<Promise<NavNode[]>>(async get => {
  const navNodes: NavNode[] = await get(clusterAndNsNodesSelector);
  const configuration = get(configurationState);
  const features = configuration?.features;

  const extResources = get(extensionsState);

  let extensibilityNodes: NavNode[] = [];
  const isExtensibilityOn =
    features?.[configFeaturesNames.EXTENSIBILITY]?.isEnabled;
  if (isExtensibilityOn && extResources) {
    const extNavNodes = extResources?.map(ext => mapExtResourceToNavNode(ext));
    extensibilityNodes = mergeInExtensibilityNav(navNodes, extNavNodes);
  }

  return [...navNodes, ...extensibilityNodes];
});
availableNodesSelector.debugLabel = 'availableNodesSelector';
