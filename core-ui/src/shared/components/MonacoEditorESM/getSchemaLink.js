import {
  namespaceNativeResourceTypes,
  clusterNativeResourceTypes,
} from 'shared/constants';
import jsyaml from 'js-yaml';
import pluralize from 'pluralize';
import LuigiClient from '@luigi-project/client';

const nativeResources = [
  ...namespaceNativeResourceTypes,
  ...clusterNativeResourceTypes,
];
const GENERIC_URL = 'https://kubernetes.io/releases';
const host =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : window.location.origin;

export const getSchemaLink = value => {
  if (!value) return GENERIC_URL;

  const resource = jsyaml.load(value);

  const resourceType = resource.kind;
  const resourceApi = resource.apiVersion;

  if (
    !resourceType ||
    !resourceApi ||
    typeof resourceType !== 'string' ||
    typeof resourceApi !== 'string'
  ) {
    return GENERIC_URL;
  }

  const isNative = nativeResources.find(
    el => el.resourceType === pluralize(resourceType).toLowerCase(),
  );

  const v = window.localStorage.getItem('cluster.version');

  console.log(isNative, v);
  if (isNative && v) {
    return `https://kubernetes.io/docs/reference/generated/kubernetes-api/${v.substring(
      0,
      v.lastIndexOf('.'),
    )}`;
  } else if (isNative && !v) {
    return GENERIC_URL;
  }

  const clusterName = LuigiClient.getContext().activeClusterName;

  if (clusterName) {
    const resourceTypeLink = pluralize(resourceType).toLowerCase();
    const trimmedResourceApi = resourceApi.split('/')[0];
    // if kubeconfig is not stored in localStorage, it will open a new busola login page
    return `${host}/cluster/${clusterName}/customresourcedefinitions/details/${resourceTypeLink}.${trimmedResourceApi}`;
  }

  return GENERIC_URL;
};
