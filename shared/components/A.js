import React, {
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from 'react';
import LuigiClient from '@luigi-project/client';
import { useRelatedResources } from './useRelatedResources';
import { relations } from './relations';

import ReactFlow, {
  removeElements,
  Controls,
  Background,
} from 'react-flow-renderer';
import { LayoutPanel, Icon, Link } from 'fundamental-react';
import { getLayoutedElements } from './getLayoutedElements';
import './graf.scss';
import { useMicrofrontendContext } from '..';
import pluralize from 'pluralize';

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

function makeNode({ resource, fromKind, isRoot, context }) {
  const icon = findIcon(resource, context);
  const navigateFn = makeNavigateFn(resource, context);
  return {
    id: resource.metadata.uid,
    fromKind,
    resource,
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
                glyph="cargo-train"
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

function makeEdge({ fromId, toId, label }) {
  return {
    id: `${fromId}-${toId}`,
    source: fromId,
    target: toId,
    type: 'step',
    label,
  };
}

function buildGraph(initialResource, context) {
  const { resources } = context;
  const rootNode = makeNode({
    resource: initialResource,
    isRoot: true,
    context,
  });

  const graph = [rootNode];
  const queue = [rootNode];

  while (!!queue.length) {
    const node = queue.pop();
    const kind = node.resource.kind;
    const mId = node.id;

    if (!relations[kind]) {
      console.warn('relation for kind not found', kind);
      continue;
    }

    for (const relation of relations[kind]) {
      try {
        const relatedResourcesOfType = relation.selectBy(
          node.resource,
          resources[relation.kind],
        );
        for (const relatedResource of relatedResourcesOfType) {
          if (relatedResource.kind === node.fromKind) {
            continue;
          }

          const relatedNodeId = relatedResource.metadata.uid;

          // add not if not exists
          if (!graph.find(g => g.id === relatedNodeId)) {
            const node = makeNode({
              resource: relatedResource,
              context,
              fromKind: kind,
            });
            graph.push(node);
            queue.push(node);
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
                label: relation.label,
              }),
            );
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }
  return graph;
}

export function A({ resource }) {
  const [t, setT] = useState(false);

  if (!t) {
    return <button onClick={() => setT(true)}>LOAD</button>;
  }
  return <AB resource={resource} />;
}

function AB({ resource }) {
  const ref = useRef();
  const [a] = useRelatedResources(resource, ref);
  return <ABC ref={ref} resource={resource} a={a} />;
}

const ABC = forwardRef(({ resource, a }, ref) => {
  const { nodeCategories, namespaceNodes } = useMicrofrontendContext();
  const onLoad = reactFlowInstance => {
    // console.log('flow loaded:', reactFlowInstance);
    reactFlowInstance.fitView();
  };

  const [elements, setElements] = useState(
    buildGraph(resource, {
      resources: a.current,
      nodeCategories,
      namespaceNodes,
    }),
  );

  useImperativeHandle(ref, () => ({
    redraw() {
      setElements(
        buildGraph(resource, {
          resources: a.current,
          nodeCategories,
          namespaceNodes,
        }),
      );
    },
  }));

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Resource map yeah" />
      </LayoutPanel.Header>
      <ReactFlow
        elements={getLayoutedElements(elements)}
        onLoad={onLoad}
        snapToGrid={true}
        nodesConnectable={false}
        elementsSelectable={false}
        snapGrid={[15, 15]}
        preventScrolling={false}
      >
        <Controls showInteractive={false} />
        <Background gap={16} />
      </ReactFlow>
    </LayoutPanel>
  );
});
