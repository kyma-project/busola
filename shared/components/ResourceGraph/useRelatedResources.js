import { useEffect, useRef, useState } from 'react';
import pluralize from 'pluralize';
import { useMicrofrontendContext, useSingleGet } from '../../';
import { getApiPath } from './helpers';
import { relations } from './relations';

function getNamespacePart({ resourceToFetch, currentNamespace }) {
  if (resourceToFetch.namespaced === false || !currentNamespace) {
    return '';
  }
  return '/namespaces/' + currentNamespace;
}

// BFS
async function cycle(store, depth, context) {
  const { fetch, namespaceNodes, clusterNodes, namespace, ref } = context;
  const kindsToHandle = Object.keys(store.current);

  const resourcesToFetch = [];
  for (const kind of kindsToHandle) {
    const rels = relations[kind];

    for (const rel of rels || []) {
      if (!store.current[rel.kind]) {
        const resourceType = pluralize(rel.kind.toLowerCase());
        const apiPath = getApiPath(resourceType, [
          ...namespaceNodes,
          ...clusterNodes,
        ]);

        if (apiPath) {
          if (!resourcesToFetch.find(r => r.kind === rel.kind)) {
            resourcesToFetch.push({
              kind: rel.kind,
              namespaced: rel.namespaced,
              resourceType,
              apiPath,
            });
          }
        }
      }
    }
  }

  await Promise.all(
    resourcesToFetch.map(async resource => {
      const namespacePart = getNamespacePart({
        resourceToFetch: resource,
        currentNamespace: namespace,
      });
      try {
        const url =
          resource.apiPath +
          namespacePart +
          '/' +
          pluralize(resource.kind.toLowerCase());

        const response = await fetch(url);
        store.current[resource.kind] = (await response.json()).items.map(i => ({
          ...i,
          kind: resource.kind,
        }));
      } catch (e) {
        console.warn(e);
      }
    }),
  );

  ref.current?.redraw();
  if (resourcesToFetch.length && depth - 1 > 0) {
    cycle(store, depth - 1, context);
  }
}

export function useRelatedResources(resource, depth, ref) {
  const { namespaceNodes, clusterNodes } = useMicrofrontendContext();
  const [startedLoading, setStartedLoading] = useState(false);
  const fetch = useSingleGet();

  const kind = resource.kind;
  const { name, namespace } = resource.metadata;
  const store = useRef({});

  useEffect(() => {
    const loadRelatedResources = async () => {
      store.current = { [kind]: [resource] };
      await cycle(store, depth, {
        fetch,
        namespaceNodes,
        clusterNodes,
        namespace,
        ref,
      });
    };

    if (startedLoading) {
      loadRelatedResources();
    }
  }, [kind, name, namespace, startedLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const startLoading = () => setStartedLoading(true);
  return [store, startedLoading, startLoading];
}
