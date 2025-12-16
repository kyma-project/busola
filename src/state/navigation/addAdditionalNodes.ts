import { ConfigFeatureList, NavNode, Scope } from '../types';
import { isEqual } from 'lodash';
import { mapBusolaResourceToNavNode } from '../resourceList/mapBusolaResourceToNavNode';
import { areNodeFeaturesEnabled } from './filters/areNodeFeaturesEnabled';

import { extensionsNavNode } from 'components/BusolaExtensions/extensionsNode';
import { helmReleasesNode } from 'components/HelmReleases/helmReleasesNode';
import { createCustomResourcesNavNode } from 'components/CustomResources/customResourcesNode';
import { namespaceOverviewNode } from 'resources/Namespaces/namespaceOverviewNode';

import * as secretMetadata from 'resources/Secrets';
import * as crdMetadata from 'resources/CustomResourceDefinitions';
import * as cmMetadata from 'resources/ConfigMaps';

import { kymaModulesNavNode } from 'components/Modules/kymaModulesNode';

export const addAdditionalNodes = (
  navNodes: NavNode[],
  scope: Scope,
  configFeatures: ConfigFeatureList,
) => {
  const extNavList = [...navNodes];

  if (scope === 'namespace') {
    addResource(namespaceOverviewNode, extNavList.length, extNavList);
  }

  const isExtEnabled = areNodeFeaturesEnabled(
    extensionsNavNode,
    configFeatures,
  );

  const cmIndex = findResourceIndex(cm, navNodes) + 1;
  if (isExtEnabled && cmIndex) {
    if (scope === 'cluster') {
      addResource(extensionsNavNode, extNavList.length, extNavList);
    }
    addResource(
      scope === 'cluster'
        ? kymaModulesNavNode
        : { ...kymaModulesNavNode, namespaced: true },
      extNavList.length,
      extNavList,
    );
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
  list.findIndex((el) => isEqual(el, res));

const addResource = (resource: NavNode, index: number, list: NavNode[]) => {
  list.splice(index, 0, resource);
};

const crd = mapBusolaResourceToNavNode(crdMetadata);
const cm = mapBusolaResourceToNavNode(cmMetadata);
const secret = mapBusolaResourceToNavNode(secretMetadata);
