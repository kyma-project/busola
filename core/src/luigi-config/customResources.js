import { config } from './config';
import { failFastFetch } from './navigation/queries';

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

  const response = await failFastFetch(
    config.backendAddress +
      `/api/v1/namespaces/kube-public/configmaps?labelSelector=${labelSelectors}`,
    authData,
  );
  const { items } = await response.json();

  return items.map(item =>
    Object.fromEntries(
      Object.entries(item.data)
        .map(([k, v]) => {
          try {
            return [k, JSON.parse(v)];
          } catch (e) {
            console.warn('cannot parse ', k, v);
            return null;
          }
        })
        .filter(Boolean),
    ),
  );
}

export async function getCustomResources(authData) {
  if (customResources) return customResources;

  customResources = Object.values({
    ...(await loadBusolaClusterCRs()),
    ...(await loadTargetClusterCRs(authData)),
  });
  console.log('customResources', customResources);

  return customResources;
}
