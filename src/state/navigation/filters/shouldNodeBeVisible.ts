import { areNodeFeaturesEnabled } from './areNodeFeaturesEnabled';
import { doesNodeResourceExist } from './doesNodeResourceExist';
import { isNodeResourcePermitted } from './isNodeResourcePermitted';
import { ConfigFeatureList, NavNode } from '../../types';
import { PermissionSet } from '../../permissionSetsSelector';

export type NavConfigSet = {
  configFeatures: ConfigFeatureList;
  openapiPathIdList: string[];
  permissionSet: PermissionSet[];
};

export const shouldNodeBeVisible = (
  configSet: NavConfigSet,
  navNode: NavNode,
) => {
  const { configFeatures, openapiPathIdList, permissionSet } = configSet;

  const nodeFeaturesEnabledInConfig = areNodeFeaturesEnabled(
    navNode,
    configFeatures,
  );

  const nodeResourceExist = doesNodeResourceExist(navNode, openapiPathIdList);

  const nodeResourcePermittedForCurrentUser = isNodeResourcePermitted(
    navNode,
    permissionSet,
  );

  if (
    navNode.resourceType === 'namespaces' &&
    nodeFeaturesEnabledInConfig &&
    nodeResourceExist
  )
    return nodeFeaturesEnabledInConfig && nodeResourceExist;

  return (
    nodeFeaturesEnabledInConfig &&
    nodeResourceExist &&
    nodeResourcePermittedForCurrentUser
  );
};
