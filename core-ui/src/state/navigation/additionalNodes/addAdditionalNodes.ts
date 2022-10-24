import { ConfigFeatureList, NavNode, Scope } from '../../types';
import { isEqual } from 'lodash';
import { createCustomResourcesNavNode } from './customResourcesNode';
import { helmReleasesNode } from './helmReleasesNode';
import { createClusterNode } from './clusterDetails';
import { namespaceOverviewNode } from './namespaceOverviewNode';
import { extensionsNavNode } from './extensionsNode';
import { mapBusolaResourceToNavNode } from '../../resourceList/mapBusolaResourceToNavNode';
import * as secretMetadata from 'resources/Secrets';
import * as crdMetadata from 'resources/CustomResourceDefinitions';

export const addAdditionalNodes = (
  navNodes: NavNode[],
  scope: Scope,
  configFeatures: ConfigFeatureList,
) => {
  const extNavList = [...navNodes];

  addResource(createClusterNode(scope), extNavList.length, extNavList);

  if (scope === 'namespace') {
    addResource(namespaceOverviewNode, extNavList.length, extNavList);
  }

  const isExtEnabled = configFeatures.EXTENSIBILITY?.isEnabled;
  if (isExtEnabled) {
    addResource(extensionsNavNode, extNavList.length, extNavList);
  }

  const crdIndex = findResourceIndex(crd, navNodes) + 1;
  if (crdIndex) {
    addResource(createCustomResourcesNavNode(scope), crdIndex, extNavList);
  }

  const secretIndex = findResourceIndex(secret, navNodes);
  if (secretIndex) {
    addResource(helmReleasesNode, secretIndex, extNavList);
  }

  return extNavList;
};

const findResourceIndex = (res: NavNode, list: NavNode[]): number =>
  list.findIndex(el => isEqual(el, res));

const addResource = (resource: NavNode, index: number, list: NavNode[]) => {
  list.splice(index, 0, resource);
};

const crd = mapBusolaResourceToNavNode(crdMetadata);
const secret = mapBusolaResourceToNavNode(secretMetadata);
