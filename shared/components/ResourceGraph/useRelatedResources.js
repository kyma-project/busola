import { useEffect, useRef, useState } from 'react';
import pluralize from 'pluralize';
import { useMicrofrontendContext, useSingleGet, getApiPath } from '../../';
import { match, relations } from './relations/relations';

function getNamespacePart({ resourceToFetch, currentNamespace }) {
  if (resourceToFetch.namespaced === false || !currentNamespace) {
    return '';
  }
  return '/namespaces/' + currentNamespace;
}

// BFS
async function cycle(store, depth, context) {
  const { fetch, navigationNodes, namespace, events } = context;
  const kindsToHandle = Object.keys(store.current);

  const resourcesToFetch = [];
  for (const kind of kindsToHandle) {
    // skip fetching relations if there's no original resource
    if (store.current[kind].length === 0) {
      continue;
    }

    for (const relation of relations[kind] || []) {
      const alreadyInStore = !!store.current[relation.kind];
      const alreadyToFetch = !!resourcesToFetch.find(
        r => r.kind === relation.kind,
      );

      if (!alreadyInStore && !alreadyToFetch) {
        // resource does not exist in store
        const resourceType = pluralize(relation.kind.toLowerCase());
        const apiPath = getApiPath(resourceType, navigationNodes);

        if (apiPath) {
          resourcesToFetch.push({
            fromKind: kind,
            kind: relation.kind,
            namespaced: relation.namespaced,
            apiPath,
          });
        }
      }
    }
  }

  const fetchResource = async resource => {
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

      const allResourcesForKind = (await response.json()).items.map(item => ({
        ...item,
        kind: resource.kind, // add kind, as it's not present on list call
      }));

      const filterOnlyRelated = possiblyRelatedResource =>
        store.current[resource.fromKind].some(oR =>
          match(possiblyRelatedResource, oR),
        );

      store.current[resource.kind] = allResourcesForKind.filter(
        filterOnlyRelated,
      );
    } catch (e) {
      console.warn(e);
    }
  };

  await Promise.all(resourcesToFetch.map(fetchResource));

  events.onRelatedResourcesRefresh();
  if (resourcesToFetch.length && depth - 1 > 0) {
    cycle(store, depth - 1, context);
  } else {
    events.onAllLoaded();
  }
}

export function useRelatedResources(resource, depth, events) {
  const { namespaceNodes, clusterNodes } = useMicrofrontendContext();
  const [startedLoading, setStartedLoading] = useState(false);
  const fetch = useSingleGet();
  const store = useRef({});

  const kind = resource.kind;
  const { name, namespace } = resource.metadata;

  useEffect(() => {
    const loadRelatedResources = async () => {
      store.current = { [kind]: [resource] };
      await cycle(store, depth, {
        fetch,
        navigationNodes: [...namespaceNodes, ...clusterNodes],
        namespace,
        events,
      });
    };

    if (startedLoading) {
      loadRelatedResources();
    }
  }, [kind, name, namespace, startedLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const startLoading = () => setStartedLoading(true);
  return [store, startedLoading, startLoading];
}
