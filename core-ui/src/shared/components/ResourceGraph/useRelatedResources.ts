import { MutableRefObject, useEffect, useRef, useState } from 'react';
import pluralize from 'pluralize';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import {
  findRelatedResources,
  getApiPath2Todo,
  match,
} from 'shared/components/ResourceGraph/buildGraph/helpers';
import { useRecoilValue } from 'recoil';
import { clusterAndNsNodesSelector } from 'state/navigation/clusterAndNsNodesSelector';
import { NavNode } from 'state/types';
import {
  IHaveNoIdeaForNameHere,
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

  const resourcesToFetch: IHaveNoIdeaForNameHere[] = [];
  for (const kind of kindsToHandle) {
    // skip fetching relations if there's no original resource
    if (store.current[kind]?.length === 0) {
      continue;
    }
    for (const relatedResource of findRelatedResources(kind, config)) {
      const alreadyInStore = !!store.current[relatedResource.kind];
      const alreadyToFetch = !!resourcesToFetch.find(
        r => r.kind === relatedResource.kind,
      );

      if (!alreadyInStore && !alreadyToFetch) {
        // resource does not exist in store
        const resourceType = pluralize(relatedResource.kind.toLowerCase());
        const apiPath = getApiPath2Todo(relatedResource, [
          ...namespaceNodes,
          ...clusterNodes,
        ]);

        if (apiPath) {
          resourcesToFetch.push({
            fromKind: kind,
            resourceType,
            kind: relatedResource.kind,
            clusterwide: relatedResource.namespace === null,
            apiPath,
          });
        }
      }
    }
  }

  const fetchResource = async (resource: IHaveNoIdeaForNameHere) => {
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

      const allResourcesForKind = (await response.json()).items.map(
        (item: K8sResource) => ({
          ...item,
          kind: resource.kind, // add kind, as it's not present on list call
        }),
      );

      const filterOnlyRelated = (possiblyRelatedResource: K8sResource) =>
        store.current[resource.fromKind]!.some(oR =>
          match(possiblyRelatedResource, oR, config),
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
    cycle(store, depth - 1, config, context);
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
  const clusterNodes = useRecoilValue(clusterAndNsNodesSelector).filter(
    node => !node.namespaced,
  );
  const namespaceNodes = useRecoilValue(clusterAndNsNodesSelector).filter(
    node => node.namespaced,
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
