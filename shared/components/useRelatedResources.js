import { useEffect, useRef } from 'react';
import pluralize from 'pluralize';
import { useMicrofrontendContext, useSingleGet } from '../index';
import { getApiPath } from './helpers';
import { relations } from './relations';

// BFS
async function cycle(store, context) {
  const { fetch, namespaceNodes, clusterNodes, namespace, ref } = context;
  const kindsToHandle = Object.keys(store.current);

  const resourcesToFetch = [];
  for (const kind of kindsToHandle) {
    const rels = relations[kind];

    for (const rel of rels) {
      if (!store.current[rel.kind]) {
        const resourceType = pluralize(rel.kind.toLowerCase());
        const apiPath = getApiPath(resourceType, namespaceNodes);

        if (apiPath) {
          if (!resourcesToFetch.find(r => r.kind === rel.kind)) {
            resourcesToFetch.push({ kind: rel.kind, resourceType, apiPath });
          }
        }
      }
    }
  }

  await Promise.all(
    resourcesToFetch.map(async resource => {
      try {
        const url =
          resource.apiPath +
          '/namespaces/' +
          namespace +
          '/' +
          pluralize(resource.kind.toLowerCase());

        const response = await fetch(url);
        store.current[resource.kind] = (await response.json()).items.map(i => ({
          ...i,
          kind: resource.kind,
        }));
      } catch (e) {
        console.log(e);
      }
    }),
  );

  ref.current?.redraw();
  if (resourcesToFetch.length) {
    cycle(store, context);
  }
}

export function useRelatedResources(resource, ref) {
  const { namespaceNodes, clusterNodes } = useMicrofrontendContext();
  const fetch = useSingleGet();

  const kind = resource.kind;
  const { name, namespace } = resource.metadata;
  const store = useRef({});

  useEffect(() => {
    const loadRelatedResources = async () => {
      store.current = { [kind]: [resource] };
      await cycle(store, {
        fetch,
        namespaceNodes,
        clusterNodes,
        namespace,
        ref,
      });
    };
    loadRelatedResources();
  }, [kind, name, namespace]);

  return [store];
}
