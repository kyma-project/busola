import React, { useState, useRef, useImperativeHandle } from 'react';

import ReactFlow, { Controls, Background } from 'react-flow-renderer';
import { LayoutPanel, Button } from 'fundamental-react';

import { useMicrofrontendContext } from '../..';
import { getLayoutedElements } from './getLayoutedElements';
import { useRelatedResources } from './useRelatedResources';
import { buildGraph } from './buildGraph';
import { useTranslation } from 'react-i18next';
import './ResourceGraph.scss';

export function ResourceGraph({
  resource,
  i18n,
  depth = Number.POSITIVE_INFINITY,
}) {
  const { t } = useTranslation(['translation'], { i18n });
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

  return (
    <LayoutPanel className="fd-margin--md resource-graph">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('resource-graph.title')} />
        {!startedLoading && (
          <Button option="emphasized" onClick={startLoading}>
            {t('common.buttons.load')}
          </Button>
        )}
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
