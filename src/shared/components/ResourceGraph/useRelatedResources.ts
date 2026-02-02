import { MutableRefObject, useEffect, useRef, useState } from 'react';
import pluralize from 'pluralize';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import {
  findRelatedResources,
  getApiPath2Todo,
  match,
} from 'shared/components/ResourceGraph/buildGraph/helpers';
import { useAtomValue } from 'jotai';
import { allNodesAtom } from 'state/navigation/allNodesAtom';
import { NavNode } from 'state/types';
import {
  FetchRequest,
  ResourceGraphConfig,
  ResourceGraphContext,
  ResourceGraphEvents,
  ResourceGraphStore,
} from './types';
import { K8sResource } from 'types';

type getNamespacePartProps = {
  resourceToFetch: any; //todo
  currentNamespace: string | null | undefined;
  namespaceNodes: NavNode[];
  clusterNodes: NavNode[];
};

function getNamespacePart({
  resourceToFetch,
  currentNamespace,
  namespaceNodes,
  clusterNodes,
}: getNamespacePartProps) {
  const findByResourceType = (resourceType: string) => (node: NavNode) =>
    node.resourceType === resourceType || node.pathSegment === resourceType;

  const namespacedNode = namespaceNodes.find(
    findByResourceType(resourceToFetch.resourceType),
  );
  const clusterNode = clusterNodes.find(
    findByResourceType(resourceToFetch.resourceType),
  );
  if (!namespacedNode && !clusterNode) {
    console.warn(
      'getNamespacePart:',
      resourceToFetch.resourceType,
      'not found.',
    );
  }

  if (resourceToFetch.clusterwide || !currentNamespace || clusterNode) {
    return '';
  }
  return '/namespaces/' + currentNamespace;
}

// BFS
async function cycle(
  store: MutableRefObject<ResourceGraphStore>,
  depth: number,
  config: ResourceGraphConfig,
  context: ResourceGraphContext,
) {
  const { fetch, namespaceNodes, clusterNodes, namespace, events } = context;
  const kindsToHandle = Object.keys(store.current);

  const resourcesToFetch: {
    [key: string]: FetchRequest;
  } = {};
  for (const kind of kindsToHandle) {
    // skip fetching relations if there's no original resource
    if (store.current[kind]?.length === 0) {
      continue;
    }
    for (const relatedResource of findRelatedResources(kind, config)) {
      const alreadyInStore = !!store.current[relatedResource.kind];

      if (!alreadyInStore) {
        const resourceType = pluralize(relatedResource.kind.toLowerCase());
        const apiPath = getApiPath2Todo(relatedResource, [
          ...namespaceNodes,
          ...clusterNodes,
        ]);

        if (!apiPath) continue;

        // If this kind is already being fetched, just add the new "fromKind"
        if (resourcesToFetch[relatedResource.kind]) {
          if (!resourcesToFetch[relatedResource.kind].fromKind.includes(kind)) {
            resourcesToFetch[relatedResource.kind].fromKind.push(kind);
          }
        } else {
          // Otherwise, create a new entry for this fetch
          resourcesToFetch[relatedResource.kind] = {
            fromKind: [kind],
            resourceType,
            kind: relatedResource.kind,
            clusterwide: relatedResource.namespace === null,
            apiPath,
          };
        }
      }
    }
  }

  const fetchResource = async (resource: FetchRequest) => {
    const namespacePart = getNamespacePart({
      resourceToFetch: resource,
      currentNamespace: namespace,
      namespaceNodes,
      clusterNodes,
    });
    try {
      const url =
        resource.apiPath +
        namespacePart +
        '/' +
        pluralize(resource.kind.toLowerCase());

      const response = await fetch(url);

      const json = await response.json();
      if (!json.items) {
        store.current[resource.kind] = [];
        return;
      }

      const allResourcesForKind = json.items.map((item: K8sResource) => ({
        ...item,
        kind: resource.kind, // add kind, as it's not present on list call
      }));

      const filterOnlyRelated = async (
        possiblyRelatedResource: K8sResource,
      ) => {
        // Iterate over all fromKinds that initiated this fetch
        for (const fromKind of resource.fromKind) {
          const originalResources = store.current[fromKind] || [];
          const matchArray = await Promise.all(
            originalResources.map(
              async (oR) =>
                !!(await match(possiblyRelatedResource, oR, config)),
            ),
          );
          // If it matches any resource from this fromKind, it's a valid relation
          if (matchArray.some(Boolean)) {
            return true;
          }
        }
        return false;
      };

      const matched = await Promise.all(
        allResourcesForKind.map(async (resource: K8sResource) => {
          const didPass = await filterOnlyRelated(resource);
          return didPass ? resource : false;
        }),
      );

      store.current[resource.kind] = matched.filter(Boolean);
    } catch (e) {
      console.warn('Failed to fetch related resources:', e);
      // Mark as fetched (with empty array) to prevent infinite retry loops
      store.current[resource.kind] = [];
    }
  };

  await Promise.all(Object.values(resourcesToFetch).map(fetchResource));

  events.onRelatedResourcesRefresh();
  if (Object.keys(resourcesToFetch).length && depth - 1 > 0) {
    await cycle(store, depth - 1, config, context);
  } else {
    events.onAllLoaded();
  }
}

type useRelatedResourcesProps = {
  resource: K8sResource;
  config: ResourceGraphConfig;
  events: ResourceGraphEvents;
};

type useRelatedResourcesReturnValue = {
  store: MutableRefObject<ResourceGraphStore>;
  startedLoading: boolean;
  startLoading: () => void;
};

export function useRelatedResources({
  resource,
  config,
  events,
}: useRelatedResourcesProps): useRelatedResourcesReturnValue {
  const clusterNodes = useAtomValue(allNodesAtom).filter(
    (node) => !node.namespaced,
  );
  const namespaceNodes = useAtomValue(allNodesAtom).filter(
    (node) => node.namespaced,
  );
  const [startedLoading, setStartedLoading] = useState(false);
  const fetch = useSingleGet();
  const store = useRef<ResourceGraphStore>({});

  const kind = resource.kind!;
  const { name, namespace } = resource.metadata;

  useEffect(() => {
    const loadRelatedResources = async () => {
      store.current = {
        [kind]: [resource],
      };
      const depth = config[kind]?.depth || Number.POSITIVE_INFINITY;
      await cycle(store, depth, config, {
        fetch,
        namespaceNodes,
        clusterNodes,
        namespace,
        events,
      });
    };

    if (startedLoading) {
      loadRelatedResources();
    }
  }, [kind, name, namespace, startedLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const startLoading = () => setStartedLoading(true);
  return { store, startedLoading, startLoading };
}
