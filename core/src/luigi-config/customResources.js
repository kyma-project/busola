import { config } from './config';
import { failFastFetch } from './navigation/queries';
import jsyaml from 'js-yaml';
import { merge } from 'lodash';

let customResources = null;

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
  const labelSelectors = `busola.io/extension=resource`;

  let items;
  try {
    const response = await failFastFetch(
      config.backendAddress +
        `/api/v1/namespaces/kube-public/configmaps?labelSelector=${labelSelectors}`,
      authData,
    );
    items = (await response.json()).items;
  } catch (e) {
    console.warn('Cannot load target cluster CRs', e);
  }
  return (items || []).map(item =>
    Object.entries(item.data).reduce((acc, [key, value]) => {
      try {
        const match = key.match(/^translations(-([a-z]{2}))?$/);
        if (match) {
          let translations = acc.translations || {};
          const lang = match[2];
          const langTranslations = jsyaml.load(value);
          if (lang) {
            translations = merge(translations, { [lang]: langTranslations });
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
      }
    }, {}),
  );
}

export async function getCustomResources(authData) {
  if (customResources) return customResources;

  const crs = await loadBusolaClusterCRs();
  console.log(crs);
  customResources = Object.values({
    ...crs,
    ...(await loadTargetClusterCRs(authData)),
  });
  return customResources;
}
