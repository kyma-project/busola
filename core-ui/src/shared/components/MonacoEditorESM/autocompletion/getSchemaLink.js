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

export const getSchemaLink = (value, language) => {
  if (language !== 'yaml') return GENERIC_URL;
  if (!value) return GENERIC_URL;

  let resource = null;
  try {
    resource = jsyaml.load(value);
  } catch (e) {
    console.error(e);
    return GENERIC_URL;
  }

  const resourceType = resource?.kind;
  const resourceApi = resource?.apiVersion;

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
    // if kubeconfig is not stored in the localStorage, it will open a new busola login page
    return `${host}/cluster/${clusterName}/customresourcedefinitions/details/${resourceTypeLink}.${trimmedResourceApi}`;
  }

  return GENERIC_URL;
};
