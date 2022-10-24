import { ConfigFeatureList, NavNode, Scope } from '../types';
import { isEqual } from 'lodash';
import { mapBusolaResourceToNavNode } from '../resourceList/mapBusolaResourceToNavNode';

import { createClusterNode } from 'components/Clusters/views/ClusterOverview/clusterDetailsNode';
import { extensionsNavNode } from 'components/BusolaExtensions/extensionsNode';
import { helmReleasesNode } from 'components/HelmReleases/helmReleasesNode';
import { createCustomResourcesNavNode } from 'components/CustomResources/customResourcesNode';
import { namespaceOverviewNode } from 'resources/Namespaces/namespaceOverviewNode';

import * as secretMetadata from 'resources/Secrets';
import * as crdMetadata from 'resources/CustomResourceDefinitions';
import * as cmMetadata from 'resources/ConfigMaps';

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
  const cmIndex = findResourceIndex(cm, navNodes) + 1;
  if (isExtEnabled && cmIndex && scope === 'cluster') {
    addResource(extensionsNavNode, extNavList.length, extNavList);
  }

  const crdIndex = findResourceIndex(crd, navNodes) + 1;
  if (crdIndex) {
    addResource(createCustomResourcesNavNode(scope), crdIndex, extNavList);
  }

  const secretIndex = findResourceIndex(secret, navNodes) + 1;
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
const cm = mapBusolaResourceToNavNode(cmMetadata);
const secret = mapBusolaResourceToNavNode(secretMetadata);
