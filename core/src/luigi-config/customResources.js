import jsyaml from 'js-yaml';
import { merge } from 'lodash';
import pluralize from 'pluralize';
import {
  getSupportedVersions,
  formatCurrentVersion,
} from '../../../core-ui/src/components/Extensibility/migration';

import { config } from './config';
import { failFastFetch } from './navigation/queries';
import {
  getActiveCluster,
  getActiveClusterName,
  getCurrentConfig,
  getCurrentContextNamespace,
} from './cluster-management/cluster-management';

let customResources = {};

async function loadBusolaClusterCRs() {
  try {
    const cacheBuster = '?cache-buster=' + Date.now();

    const response = await fetch(
      `/assets/customResources/customResources.json${cacheBuster}`,
    );

    return await response.json();
  } catch (e) {
    console.warn(`Cannot load customResources.json: `, e);
    return null;
  }
}

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
    .map(configMap => {
      const cr = Object.fromEntries(
        Object.entries(configMap?.data || {}).map(
          ([sectionKey, yamlString]) => {
            let decodedSection = [sectionKey, null];
            try {
              decodedSection = [
                sectionKey,
                jsyaml.load(yamlString, { json: true }),
              ];
            } catch (error) {
              console.warn('cannot parse ', sectionKey, yamlString, error);
            }
            return decodedSection;
          },
        ),
      );

      if (!cr?.resource || Object.keys(cr.resource).length === 0) {
        console.warn(
          'Some of the custom resources are not configured properly.',
        );
        return null;
      } else if (!cr.resource.path && !cr.resource.kind) {
        console.warn(
          'Some of the custom resources are not configured properly. Should have kind defined.',
        );
        return null;
      } else if (!cr.resource.path) {
        cr.resource.path = pluralize(cr.resource.kind).toLowerCase();
      }

      return cr;
    })
    .filter(cr => !!cr);
}

export async function getCustomResources(authData) {
  const { features } = await getCurrentConfig();
  const clusterName = getActiveClusterName();

  if (features.EXTENSIBILITY?.isEnabled) {
    if (customResources[clusterName]) {
      return customResources[clusterName];
    }

    customResources[clusterName] = Object.values({
      ...(await loadBusolaClusterCRs()),
      ...(await loadTargetClusterCRs(authData)),
    });

    customResources[clusterName] = customResources[
      clusterName
    ].filter(resource =>
      getSupportedVersions().some(
        version => formatCurrentVersion(resource.version) === version,
      ),
    );
    return customResources[clusterName];
  }
  return [];
}
