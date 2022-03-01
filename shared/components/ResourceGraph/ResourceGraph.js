import React, { useState, useRef, useImperativeHandle, useEffect } from 'react';
import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { Graphviz } from 'graphviz-react';
import { saveAs } from 'file-saver';
// import svgPanZoom from 'svg-pan-zoom';

import {
  LayoutPanel,
  Button,
  Select,
  Icon,
  ButtonSegmented,
} from 'fundamental-react';

import { Tooltip, useMicrofrontendContext } from '../..';
import { useRelatedResources } from './useRelatedResources';
import {
  buildGraph,
  GRAPH_TYPE_STRUCTURAL,
  GRAPH_TYPE_NETWORK,
} from './buildGraph';
import { useTranslation } from 'react-i18next';
import './ResourceGraph.scss';
import { networkFlow } from './relations';
import { makeDot } from './makeDot';

export const isEdge = e => !!e.source && !!e.target;
export const isNode = e => !isEdge(e);

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

export function ResourceGraph({
  resource,
  i18n,
  depth = Number.POSITIVE_INFINITY,
}) {
  const hasNetworkView = networkFlow.includes(resource.kind);
  const { t } = useTranslation(['translation'], { i18n });
  const [graphType, setGraphType] = useState(GRAPH_TYPE_STRUCTURAL);
  const relatedResourceRef = useRef();
  const svgControlRef = useRef();
  const [elements, setElements] = useState([]);
  const [resourcesStore, startedLoading, startLoading] = useRelatedResources(
    resource,
    depth,
    relatedResourceRef,
  );

  const { nodeCategories, namespaceNodes } = useMicrofrontendContext();
  useImperativeHandle(relatedResourceRef, () => ({
    onRelatedResourcesRefresh() {
      setElements(
        buildGraph(resource, depth, {
          resources: resourcesStore.current,
          nodeCategories,
          namespaceNodes,
          t,
        }),
      );
    },
  }));

  useEffect(() => {
    const initEventListeners = () => {
      const nodes = document.querySelectorAll('#graphviz0 title');
      for (const element of elements.filter(isNode)) {
        const node = [...nodes].find(
          n => n.textContent === element.resource.metadata.uid,
        )?.parentNode;

        if (!node) {
          console.log('nie ma', node, element.resource);
          continue;
        }

        if (element.resource.metadata.uid === resource.metadata.uid) {
          node.classList.add('root-node');
        } else {
          node.onclick = makeNavigateFn(element.resource);
        }
      }
    };

    // const initSvgControl = () => {
    //   // svgPanZoom has its own controls (.enableControlIcons(), but they don't match fiori style)
    //   svgControlRef.current = svgPanZoom('#graphviz0 svg');
    //   // zoom out for a single element
    //   console.log('ok')
    //   if (elements.length === 1) {
    //     svgControlRef.current.zoom(0.5);
    //   }
    // };

    if (document.querySelector('#graphviz0 svg')) {
      initEventListeners();
      // initSvgControl();

      setTimeout(() => {
        window.scroll(0, window.outerHeight);
      });
      // return () => {
      //   console.log(svgControlRef.current);
      //   return () => svgControlRef.current?.destroy();
      // };
    }
  }, [elements, resource, graphType]);

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
          <div className="controls controls__left">
            <ButtonSegmented>
              <Button
                aria-label="zoom out"
                glyph="zoom-out"
                onClick={() => svgControlRef.current?.zoomOut()}
              />
              <Button onClick={() => svgControlRef.current?.fit()}>
                Center
              </Button>
              <Button
                aria-label="zoom in"
                glyph="zoom-in"
                onClick={() => svgControlRef.current?.zoomIn()}
              />
            </ButtonSegmented>
          </div>
          <Button
            className="controls controls__right"
            onClick={() => {
              const dot = makeDot(elements, graphType);
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
