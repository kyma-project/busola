import React from 'react';
import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { Icon, Link } from 'fundamental-react';
import { matchBy, relations } from './relations';

export const GRAPH_TYPE_STRUCTURAL = 'STRUCTURAL';
export const GRAPH_TYPE_NETWORK = 'NETWORK';

function findIcon(resource, { nodeCategories, namespaceNodes }) {
  const resourceType = pluralize(resource.kind.toLowerCase());

  const node = namespaceNodes.find(
    n =>
      n.resourceType === resourceType || n.navigationContext === resourceType,
  );

  const category = node && nodeCategories.find(c => c.label === node.category);
  return category?.icon;
}

function makeNavigateFn(resource) {
  const {
    metadata: { name, namespace },
    kind,
  } = resource;

  let path = `${pluralize(kind.toLowerCase())}/details/${name}`;
  if (namespace) {
    path = `namespaces/${namespace}/${path}`;
  }
  return () =>
    LuigiClient.linkManager()
      .fromContext('cluster')
      .navigate(path);
}

function makeNode({ resource, fromKind, isRoot, depth, context }) {
  const icon = findIcon(resource, context);
  const navigateFn = makeNavigateFn(resource, context);
  return {
    id: resource.metadata.uid,
    fromKind,
    resource,
    depth,
    type: 'input',
    data: {
      label: (
        <>
          <Icon
            glyph={icon}
            ariaLabel="category-icon"
            className="fd-margin-end--tiny"
          />
          {resource.kind}
          <br /> {resource.metadata.name}
          {!isRoot && (
            <Link className="fd-link" onClick={navigateFn}>
              <Icon
                glyph="inspect"
                ariaLabel="link-icon"
                className="fd-margin-begin--tiny"
              />
            </Link>
          )}
        </>
      ),
    },
  };
}

export function makeEdge({ fromId, toId, labelKey, context }) {
  const { t } = context;
  return {
    id: `${fromId}-${toId}`,
    source: fromId,
    target: toId,
    type: 'step',
    label: labelKey && t(labelKey),
  };
}

export function buildGraph(initialResource, depth, context) {
  const { resources } = context;
  const rootNode = makeNode({
    resource: initialResource,
    isRoot: true,
    depth,
    context,
  });

  const graph = [rootNode];
  const queue = [rootNode];

  while (!!queue.length) {
    const node = queue.pop();
    if (node.depth <= 0) continue;

    const kind = node.resource.kind;
    const mId = node.id;

    if (!relations[kind]) {
      console.warn('relation for kind not found', kind);
      continue;
    }

    for (const relation of relations[kind]) {
      let relatedResourcesOfType = null;
      try {
        relatedResourcesOfType = matchBy(
          node.resource,
          resources[relation.kind] || [],
        );
      } catch (e) {
        console.warn(e);
        // ignore errors shown when resource is not loaded yet
        continue;
      }
      for (const relatedResource of relatedResourcesOfType) {
        if (relatedResource.kind === node.fromKind) {
          continue;
        }

        const relatedNodeId = relatedResource.metadata.uid;

        // add not if not exists
        if (!graph.find(g => g.id === relatedNodeId)) {
          const newNode = makeNode({
            resource: relatedResource,
            context,
            depth: node.depth - 1,
            fromKind: kind,
          });
          graph.push(newNode);
          queue.push(newNode);
        }
        // connect nodes if not connected
        if (
          !graph.find(
            g =>
              g.id === `${mId}-${relatedNodeId}` ||
              g.id === `${relatedNodeId}-${mId}`,
          )
        ) {
          graph.push(
            makeEdge({
              fromId: mId,
              toId: relatedNodeId,
              labelKey: relation.labelKey,
              context,
            }),
          );
        }
      }
    }
  }
  return graph;
}
