import React, { useState, useRef, useImperativeHandle, useEffect } from 'react';
import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { Graphviz } from 'graphviz-react';
import { saveAs } from 'file-saver';

import { LayoutPanel, Button, Select, Icon } from 'fundamental-react';

import { Tooltip, useMicrofrontendContext } from '../..';
import { useRelatedResources } from './useRelatedResources';
import {
  buildGraph,
  GRAPH_TYPE_STRUCTURAL,
  GRAPH_TYPE_NETWORK,
} from './buildGraph';
import { useTranslation } from 'react-i18next';
import './ResourceGraph.scss';

const isEdge = e => !!e.source && !!e.target;
const isNode = e => !isEdge(e);

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

function makeDot(elements) {
  const makeNode = n =>
    `"${n.id}" [label="${n.resource.kind}\n${n.resource.metadata.name}"][shape=box]`;
  const makeEdge = e => `"${e.source}" -> "${e.target}"`;

  const nodes = elements.filter(isNode).map(makeNode);
  const edges = elements.filter(isEdge).map(makeEdge);

  return `digraph {
  ranksep="2.0 equally";
  ${nodes.join('\n\t')}
  ${edges.join('\n\t')}
  }`;
}

export function ResourceGraph({
  resource,
  i18n,
  depth = Number.POSITIVE_INFINITY,
  hasNetworkView = true,
}) {
  const { t } = useTranslation(['translation'], { i18n });
  const [graphType, setGraphType] = useState(GRAPH_TYPE_STRUCTURAL);
  const ref = useRef();
  const [elements, setElements] = useState([]);
  const [resourcesStore, startedLoading, startLoading] = useRelatedResources(
    resource,
    depth,
    ref,
  );

  const { nodeCategories, namespaceNodes } = useMicrofrontendContext();
  useImperativeHandle(ref, () => ({
    redraw() {
      setElements(
        buildGraph(resource, {
          resources: resourcesStore.current,
          nodeCategories,
          namespaceNodes,
          t,
        }),
      );
    },
  }));

  useEffect(() => {
    const nodes = document.querySelectorAll('#graphviz0 title');
    for (const element of elements.filter(isNode)) {
      const node = [...nodes].find(
        n => n.textContent === element.resource.metadata.uid,
      )?.parentNode;
      if (!node) continue;
      node.onclick = makeNavigateFn(element.resource);
    }
  }, [elements, resource]);

  const viewSwitcher = hasNetworkView && (
    <div className="view-switcher">
      <Tooltip
        delay="0"
        className="fd-margin-end--tiny view-switcher__tooltip"
        content={
          graphType === GRAPH_TYPE_STRUCTURAL
            ? t('resource-graph.graph-types.structural-tooltip')
            : t('resource-graph.graph-types.network-tooltip')
        }
      >
        <Icon glyph="question-mark" size="m" ariaLabel="question-mark" />
      </Tooltip>
      <Select
        selectedKey={graphType}
        options={[
          {
            key: GRAPH_TYPE_STRUCTURAL,
            text: t('resource-graph.graph-types.structural'),
          },
          {
            key: GRAPH_TYPE_NETWORK,
            text: t('resource-graph.graph-types.network'),
          },
        ]}
        onSelect={(_, selected) => setGraphType(selected.key)}
      />
    </div>
  );

  const actions = startedLoading ? (
    viewSwitcher
  ) : (
    <Button option="emphasized" onClick={startLoading}>
      {t('common.buttons.load')}
    </Button>
  );

  return (
    <LayoutPanel className="fd-margin--md resource-graph">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('resource-graph.title')} />
        {actions}
      </LayoutPanel.Header>
      {startedLoading && (
        <div id="graph-area">
          <Graphviz
            dot={makeDot(elements)}
            // https://github.com/magjac/d3-graphviz#selection_graphviz
            options={{
              fit: true,
              height: '500px',
              width: '100%',
              zoom: true,
              useWorker: false,
            }}
          />
          <Button
            option="transparent"
            className="controls"
            onClick={() => {
              const dot = makeDot(elements);
              const blob = new Blob([dot], {
                type: '	text/vnd.graphviz',
              });
              const name = `${resource.kind} ${
                resource.metadata.name
              }-${graphType.toLowerCase()}.gv`;
              saveAs(blob, name);
            }}
          >
            <Icon
              ariaLabel="download"
              glyph="download"
              className="fd-margin-end--tiny"
            />
            dot format
          </Button>
        </div>
      )}
    </LayoutPanel>
  );
}
