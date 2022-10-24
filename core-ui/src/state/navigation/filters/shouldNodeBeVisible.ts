import { hasCurrentScope } from './hasCurrentScope';
import { areNodeFeaturesEnabled } from './areNodeFeaturesEnabled';
import { doesNodeResourceExist } from './doesNodeResourceExist';
import { isNodeResourcePermitted } from './isNodeResourcePermitted';
import { ConfigFeatureList, NavNode, Scope } from '../../types';
import { PermissionSet } from '../../permissionSetsAtom';

type NavConfigSet = {
  scope: Scope;
  configFeatures: ConfigFeatureList;
  openapiPathIdList: string[];
  permissionSet: PermissionSet[];
};

export const shouldNodeBeVisible = (
  configSet: NavConfigSet,
  navNode: NavNode,
) => {
  const { scope, configFeatures, openapiPathIdList, permissionSet } = configSet;

  const currentScope = hasCurrentScope(navNode, scope);

  const nodeFeaturesEnabledInConfig = areNodeFeaturesEnabled(
    navNode,
    configFeatures,
  );

  const nodeResourceExist = doesNodeResourceExist(navNode, openapiPathIdList);

  const nodeResourcePermittedForCurrentUser = isNodeResourcePermitted(
    navNode,
    permissionSet,
  );

  return (
    currentScope &&
    nodeFeaturesEnabledInConfig &&
    nodeResourceExist &&
    nodeResourcePermittedForCurrentUser
  );
};
