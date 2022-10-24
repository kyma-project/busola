import { RecoilValueReadOnly, selector } from 'recoil';
import { isEmpty } from 'lodash';
import { resourceListSelector } from '../resourceList/resourceListSelector';
import {
  activeNamespaceIdState,
  defaultValue as defaultNamespaceName,
} from '../activeNamespaceIdAtom';
import { openapiPathIdListSelector } from '../openapi/openapiPathIdSelector';
import { configFeaturesState } from '../configFeaturesAtom';
import { filterExistingNodes } from './filters/filterExistingNodes';
import { filterScopeNodes } from './filters/filterScopeNodes';
import { filterNodesWithDisabledFeatures } from './filters/filterNodesWithDisabledFeatures';
import { assignNodesToCategories } from './assignToCategories';
import { filterPermittedNodes } from './filters/filterPermittedNodes';
import { permissionSetsAtom } from '../permissionSetsAtom';
import { Category } from './categories';
import { NavNode } from '../types';
import { hasCurrentScope } from './filters/hasCurrentScope';
import { areNodeFeaturesDisabled } from './filters/areNodeFeaturesDisabled';
import { doesNodeResourceExist } from './filters/doesNodeResourceExist';
import { isNodeResourcePermitted } from './filters/isNodeResourcePermitted';

export const navigationNodesSelector: RecoilValueReadOnly<Category[]> = selector<
  Category[]
>({
  key: 'navigationNodesSelector',
  get: async ({ get }) => {
    const resourceList: NavNode[] = get(resourceListSelector);
    const activeNamespaceId = get(activeNamespaceIdState);
    const openapiPathIdList = get(openapiPathIdListSelector);
    const configFeatures = get(configFeaturesState);
    const permissionSet = get(permissionSetsAtom);
    const areDependenciesInitialized =
      openapiPathIdList &&
      configFeatures &&
      !isEmpty(resourceList) &&
      activeNamespaceId !== defaultNamespaceName &&
      !isEmpty(permissionSet);

    if (!areDependenciesInitialized) {
      return [];
    }

    const scope = activeNamespaceId ? 'namespace' : 'cluster';

    const allowedNodes = resourceList.filter(navNode => {
      const currentScope = hasCurrentScope(navNode, scope);
      const nodeFeaturesEnabledInConfig = areNodeFeaturesDisabled(
        navNode,
        configFeatures,
      );
      const nodeResourceExist = doesNodeResourceExist(
        navNode,
        openapiPathIdList,
      );
      const nodeResourcePermittedForCurrentUser = isNodeResourcePermitted(
        navNode,
        permissionSet,
      );

      console.log(
        navNode.resourceType,
        currentScope,
        nodeFeaturesEnabledInConfig,
        nodeResourceExist,
        nodeResourcePermittedForCurrentUser,
      );

      return (
        currentScope &&
        nodeFeaturesEnabledInConfig &&
        nodeResourceExist &&
        nodeResourcePermittedForCurrentUser
      );
    });

    console.log(allowedNodes);
    // const currentScopeNodes: NavNode[] = filterScopeNodes(resourceList, scope);
    //
    // const noDisabledFeaturesNodes: NavNode[] = filterNodesWithDisabledFeatures(
    //   currentScopeNodes,
    //   configFeatures,
    // );
    //
    // const existingNodes: NavNode[] = filterExistingNodes(
    //   noDisabledFeaturesNodes,
    //   openapiPathIdList,
    // );
    //
    // const allowedNodes: NavNode[] = filterPermittedNodes(
    //   existingNodes,
    //   permissionSet,
    // );

    const crdIndex = findResourceIndex(crd, allowedNodes) + 1;
    const crNavNode = {
      category: 'Configuration',
      resourceType: 'customresources',
      pathSegment: 'customresources',
      label: 'Custom Resources',
      namespaced: scope === 'namespace',
      requiredFeatures: [],
      apiGroup: 'apiextensions.k8s.io',
      apiVersion: 'v1',
    };
    if (crdIndex) {
      addResource(crNavNode, crdIndex, allowedNodes);
    }

    //TODO
    // // missing on NS
    // custom resources  if crd allowed show on namespace
    // helm releases    if secrets allowed show on namespace
    // overview  if scope === namespace add this manually
    // back to cluster details    --> if scope === namespace add this manually
    // // missing on cluster
    // custom resources if crd allowed show on cluster
    // extensions       if ext allowed in the config show on cluster
    // cluster details   --> if scope === namespace add this manually

    // const

    // if (isCustomResourceAllowed) addCustomResource;
    // if (isScopeNamespace) {
    //   addOverweir;
    //   addClusterDetails;
    // }

    const assignedToCategories: Category[] = assignNodesToCategories(
      allowedNodes,
    );

    return assignedToCategories;
  },
});

const crd: ResourceInfo = {
  type: 'customresourcedefinitions',
  apiGroup: 'apiextensions.k8s.io',
  apiVersion: 'v1',
};

type ResourceInfo = {
  type: string;
  apiGroup: string;
  apiVersion: string;
};
const findResourceIndex = (res: ResourceInfo, list: NavNode[]): number =>
  list.findIndex(el => {
    const sameResourceType = el.resourceType === res.type;
    const sameApiGroup = el.apiGroup === res.apiGroup;
    const sameApiVersion = el.apiVersion === res.apiVersion;
    return sameResourceType && sameApiGroup && sameApiVersion;
  });

const addResource = (resource: NavNode, index: number, list: NavNode[]) => {
  list.splice(index, 0, resource);
};
