import { atom } from 'jotai';
import { unwrap } from 'jotai/utils';
import { getFetchFn } from 'state/utils/getFetchFn';
import { openapiPathIdListAtom } from 'state/openapi/openapiPathIdAtom';

// Accept header for aggregated discovery — newest format first, legacy JSON last.
const ACCEPT_AGGREGATED_DISCOVERY = [
  'application/json;g=apidiscovery.k8s.io;v=v2;as=APIGroupDiscoveryList',
  'application/json;g=apidiscovery.k8s.io;v=v2beta1;as=APIGroupDiscoveryList',
  'application/json',
].join(',');

type DiscoveryDoc = {
  kind?: string;
  items?: {
    metadata?: { name?: string };
    versions?: { version?: string; resources?: { resource?: string }[] }[];
  }[];
};

// Flattens discovery into lowercased collection path-ids (/api/<v>/<plural>,
// /apis/<group>/<v>/<plural>); null if the response isn't the aggregated format.
export function aggregatedDiscoveryPathIds(
  responses: unknown[],
): string[] | null {
  const docs = responses as DiscoveryDoc[];
  if (!docs.every((doc) => doc?.kind === 'APIGroupDiscoveryList')) return null;

  const paths: string[] = [];
  for (const doc of docs) {
    for (const group of doc.items ?? []) {
      const prefix = group.metadata?.name
        ? `/apis/${group.metadata.name}`
        : '/api';
      for (const { version, resources } of group.versions ?? []) {
        for (const { resource } of resources ?? []) {
          if (version && resource) {
            paths.push(`${prefix}/${version}/${resource}`.toLowerCase());
          }
        }
      }
    }
  }
  return paths;
}

// Fetches aggregated discovery once per cluster. null means the cluster doesn't
// support it so callers fall back to OpenAPI.
const discoveryPathIdsAtom = atom<Promise<string[] | null>>(async (get) => {
  const fetchFn = getFetchFn(get);
  if (!fetchFn) return null;

  try {
    const init = { headers: { Accept: ACCEPT_AGGREGATED_DISCOVERY } };
    const [core, apis] = await Promise.all([
      fetchFn({ relativeUrl: '/api', init }).then((r) => r.json()),
      fetchFn({ relativeUrl: '/apis', init }).then((r) => r.json()),
    ]);
    return aggregatedDiscoveryPathIds([core, apis]);
  } catch (e) {
    console.warn('Aggregated discovery failed, falling back to OpenAPI:', e);
    return null;
  }
});
discoveryPathIdsAtom.debugLabel = 'discoveryPathIdsAtom';

// Fall back to the openapi path list when discovery is unsupported/failed.
const resourcePathsAsyncAtom = atom<Promise<string[]>>(async (get) => {
  const discovered = await get(discoveryPathIdsAtom);
  return discovered ?? get(openapiPathIdListAtom);
});

export const resourcePathsAtom = unwrap(
  resourcePathsAsyncAtom,
  (prev) => prev ?? [],
);
resourcePathsAtom.debugLabel = 'resourcePathsAtom';
