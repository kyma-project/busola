import React, { useState, useRef, useImperativeHandle } from 'react';

import ReactFlow, { Controls, Background } from 'react-flow-renderer';
import { LayoutPanel, Button, Select, Icon } from 'fundamental-react';

import { Tooltip, useMicrofrontendContext } from '../..';
import { getLayoutedElements } from './getLayoutedElements';
import { useRelatedResources } from './useRelatedResources';
import {
  buildGraph,
  GRAPH_TYPE_STRUCTURAL,
  GRAPH_TYPE_NETWORK,
} from './buildGraph';
import { useTranslation } from 'react-i18next';
import './ResourceGraph.scss';

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
  const [flow, setFlow] = useState(null);
  const onLoad = reactFlowInstance => {
    setFlow(reactFlowInstance);
    reactFlowInstance.fitView();
    window.scrollTo(0, document.body.scrollHeight);
  };

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
      flow?.fitView();
    },
  }));

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
      )}
    </LayoutPanel>
  );
}
