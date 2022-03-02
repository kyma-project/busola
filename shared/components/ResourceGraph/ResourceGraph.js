import React, { useState, useRef, useCallback } from 'react';
import { Graphviz } from 'graphviz-react';
import svgPanZoom from 'svg-pan-zoom';

import { LayoutPanel, Button, Select, Icon } from 'fundamental-react';
import { navigateToResource, Tooltip, useMicrofrontendContext } from '../..';
import { useRelatedResources } from './useRelatedResources';
import {
  buildGraph,
  GRAPH_TYPE_STRUCTURAL,
  GRAPH_TYPE_NETWORK,
} from './buildGraph';
import { useTranslation } from 'react-i18next';
import { networkFlow } from './relations/relations';
import { makeDot } from './makeDot';
import './ResourceGraph.scss';
import { PanZoomControls } from './components/PanZoomControls';
import { SaveGraphControls } from './components/SaveGraphControls';

export const isEdge = e => !!e.source && !!e.target;
export const isNode = e => !isEdge(e);

export function ResourceGraph({
  resource,
  i18n,
  depth = Number.POSITIVE_INFINITY,
}) {
  const hasNetworkView = networkFlow.includes(resource.kind);
  const { t } = useTranslation(['translation'], { i18n });
  const [graphType, setGraphType] = useState(GRAPH_TYPE_STRUCTURAL);
  const svgControlRef = useRef();
  const [elements, setElements] = useState([]);
  const { nodeCategories, namespaceNodes } = useMicrofrontendContext();

  const onAllLoaded = useCallback(() => {
    console.log('loaded');
    const initEventListeners = () => {
      const nodes = document.querySelectorAll('#graph-area title');
      // access fresh instance of elements, instead of resorting to using useImperativeHandle
      setElements(elements => {
        for (const element of elements.filter(isNode)) {
          const node = [...nodes].find(
            n => n.textContent === element.resource.metadata.uid,
          )?.parentNode;

          if (!node) continue;

          if (element.resource.metadata.uid === resource.metadata.uid) {
            node.classList.add('root-node');
          } else {
            node.onclick = () => navigateToResource(element.resource);
          }
        }
        return elements;
      });
    };
    const initPanZoom = () => {
      // svgPanZoom has its own controls (.enableControlIcons(), but they don't match fiori style)
      svgControlRef.current = svgPanZoom('#graph-area svg');
      // zoom out for a single element
      if (elements.length === 1) {
        svgControlRef.current.zoom(0.5);
      }
    };

    initEventListeners();
    // initPanZoom();
  }, [elements, resource.metadata.uid]);

  const onRelatedResourcesRefresh = () => {
    console.log('fresh');
    setElements(
      buildGraph(resource, depth, {
        resources: resourcesStore.current,
        nodeCategories,
        namespaceNodes,
        t,
      }),
    );
  };

  const [resourcesStore, startedLoading, startLoading] = useRelatedResources(
    resource,
    depth,
    {
      onAllLoaded,
      onRelatedResourcesRefresh,
    },
  );

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
            dot={makeDot(elements, graphType)}
            // https://github.com/magjac/d3-graphviz#selection_graphviz
            options={{
              height: '500px',
              width: '100%',
              zoom: false,
              useWorker: false,
              // 'dot' makes nicer layouts, but doesn't support pos attribute
              engine: graphType === GRAPH_TYPE_STRUCTURAL ? 'dot' : 'fdp',
            }}
          />
          <PanZoomControls panZoomRef={svgControlRef} i18n={i18n} />
          <SaveGraphControls
            getContent={() => makeDot(elements, graphType)}
            getName={() =>
              `${resource.kind} ${
                resource.metadata.name
              }-${graphType.toLowerCase()}.gv`
            }
            i18n={i18n}
          />
        </div>
      )}
    </LayoutPanel>
  );
}
