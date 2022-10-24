import { RecoilValueReadOnly, selector } from 'recoil';
import { isEmpty, partial } from 'lodash';
import { resourceListSelector } from '../resourceList/resourceListSelector';
import {
  activeNamespaceIdState,
  defaultValue as defaultNamespaceName,
} from '../activeNamespaceIdAtom';
import { openapiPathIdListSelector } from '../openapi/openapiPathIdSelector';
import { configFeaturesState } from '../configFeaturesAtom';
import { assignNodesToCategories } from './assignToCategories';
import { permissionSetsAtom } from '../permissionSetsAtom';
import { Category } from './categories';
import { NavNode } from '../types';
import { shouldNodeBeVisible } from './filters/shouldNodeBeVisible';

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
      openapiPathIdList && //
      configFeatures && //
      !isEmpty(resourceList) &&
      activeNamespaceId !== defaultNamespaceName &&
      !isEmpty(permissionSet);

    if (!areDependenciesInitialized) {
      return [];
    }

    const scope: 'namespace' | 'cluster' = activeNamespaceId
      ? 'namespace'
      : 'cluster';

    const configSet = {
      scope,
      configFeatures,
      openapiPathIdList,
      permissionSet,
    };
    const nodeAllowedForCurrentConfigSet = partial(
      shouldNodeBeVisible,
      configSet,
    );
    const navNodes: NavNode[] = resourceList.filter(
      nodeAllowedForCurrentConfigSet,
    );

    const crdIndex = findResourceIndex(crd, navNodes) + 1;
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
      addResource(crNavNode, crdIndex, navNodes);
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

    const assignedToCategories: Category[] = assignNodesToCategories(navNodes);

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
