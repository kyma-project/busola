import jsyaml from 'js-yaml';
import { merge } from 'lodash';
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
    .filter(item =>
      SUPPORTED_VERSIONS.some(
        version =>
          formatCurrentVersion(
            item.metadata.labels?.['busola.io/extension-version'],
          ) === version,
      ),
    )
    .map(item => {
      const cr = Object.entries(item?.data || []).reduce(
        (acc, [key, value]) => {
          try {
            const match = key.match(/^translations(-([a-z]{2}))?$/);
            if (match) {
              let translations = acc.translations || {};
              const lang = match[2];
              const langTranslations = jsyaml.load(value);
              if (lang) {
                translations = merge(translations, {
                  [lang]: langTranslations,
                });
              } else {
                translations = merge(translations, langTranslations);
              }
              return { ...acc, translations };
            }

            return {
              ...acc,
              [key]: jsyaml.load(value, { json: true }),
            };
          } catch (error) {
            console.warn('cannot parse ', key, value, error);
            return null;
          }
        },
        {},
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

    return customResources[clusterName];
  }
  return [];
}
