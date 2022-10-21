import jsyaml from 'js-yaml';
import { mapValues } from 'lodash';
import pluralize from 'pluralize';

const SUPPORTED_VERSIONS = ['0.4', '0.5'];
const formatCurrentVersion = version => {
  if (!version) return null;
  return (
    version
      .toString()
      .replaceAll("'", '')
      .replaceAll('"', '') || ''
  );
};

import { config } from './config';
import { failFastFetch } from './navigation/queries';
import {
  getActiveCluster,
  getActiveClusterName,
  getCurrentConfig,
  getCurrentContextNamespace,
} from './cluster-management/cluster-management';
//Luigi has to have defined the exact path with 'index'
import { busolaOwnExtConfigs } from './customResources/index';

async function getBuiltinCustomResources() {
  try {
    const response = await fetch('/assets/extensions/extensions.yaml');
    const extensions = jsyaml.loadAll(await response.text());
    if (Array.isArray(extensions)) {
      return extensions;
    } else {
      return [];
    }
  } catch (e) {
    console.log(e);
    return [];
  }
}

let customResources = {};

async function loadTargetClusterCRs(authData) {
  const activeCluster = getActiveCluster();
  const namespace =
    getCurrentContextNamespace(activeCluster?.kubeconfig) || 'kube-public';

  const labelSelectors = `busola.io/extension=resource`;

  let items;
  try {
    let response = await failFastFetch(
      config.backendAddress +
        `/api/v1/configmaps?labelSelector=${labelSelectors}`,
      authData,
    );
    if (response.status >= 400) {
      response = await failFastFetch(
        config.backendAddress +
          `/api/v1/namespaces/${namespace}/configmaps?labelSelector=${labelSelectors}`,
        authData,
      );
    }
    items = (await response.json()).items;
  } catch (e) {
    console.warn('Cannot load target cluster CRs', e);
  }
  return (items || [])
    .filter(item =>
      SUPPORTED_VERSIONS.some(
        version =>
          formatCurrentVersion(
            item.metadata.labels?.['busola.io/extension-version'],
          ) === version,
      ),
    )
    .map(configMap => {
      const convertYamlToObject = yamlString => {
        try {
          return jsyaml.load(yamlString, { json: true });
        } catch (error) {
          console.warn('cannot parse ', yamlString, error);
          return null;
        }
      };
      const cr = mapValues(configMap?.data || {}, convertYamlToObject);
      const urlPath = cr?.general?.urlPath;
      const resource = cr?.general?.resource;

      if (!resource || Object.keys(resource).length === 0) {
        console.warn(
          'Some of the custom resources are not configured properly.',
        );
        return null;
      } else if (!urlPath && !resource.kind) {
        console.warn(
          'Some of the custom resources are not configured properly. Should have kind defined.',
        );
        return null;
      } else if (!urlPath) {
        cr.general.urlPath = pluralize(resource.kind).toLowerCase();
      }

      return cr;
    })
    .filter(cr => !!cr);
}

export async function getCustomResources(authData) {
  const { features } = await getCurrentConfig();
  const clusterName = getActiveClusterName();

  if (customResources[clusterName]) {
    return customResources[clusterName];
  }

  customResources[clusterName] = await getBuiltinCustomResources();

  if (features.EXTENSIBILITY?.isEnabled) {
    customResources[clusterName] = [
      ...busolaOwnExtConfigs,
      ...customResources[clusterName],
    ];
    const targetClusterCustomResources = await loadTargetClusterCRs(authData);

    const additionalExtResources = Object.values({
      ...targetClusterCustomResources,
    });

    customResources[clusterName] = [
      ...customResources[clusterName],
      ...additionalExtResources,
    ];
  }
  return customResources[clusterName];
}

export async function getExtensibilitySchemas() {
  const cacheBuster = '?cache-buster=' + Date.now();

  const detailsResponse = await fetch(
    `/assets/customResources/schema-details.json${cacheBuster}`,
  );
  const details = await detailsResponse.json();
  return {
    details,
  };
}
