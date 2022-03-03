import React, { useState } from 'react';
import { Graphviz } from 'graphviz-react';

import { navigateToResource } from '../..';
import { useRelatedResources } from './useRelatedResources';
import { buildStructuralGraph } from './buildStructuralGraph';
import {
  buildNetworkGraph,
  networkFlowResources,
} from './buildNetworkGraph.js';
import { useTranslation } from 'react-i18next';
import { LayoutPanel, Button } from 'fundamental-react';
import { SaveGraphControls } from './components/SaveGraphControls';
import './ResourceGraph.scss';

export const isEdge = e => !!e.source && !!e.target;
export const isNode = e => !isEdge(e);

export function ResourceGraph({
  resource,
  i18n,
  depth = Number.POSITIVE_INFINITY,
}) {
  const isStructural = !networkFlowResources.includes(resource.kind);
  const { t } = useTranslation(['translation'], { i18n });
  const [dot, setDot] = useState('');

  const onAllLoaded = () => {
    const data = {
      initialResource: resource,
      depth,
      context: {},
      store: resourcesStore.current,
    };
    setDot(isStructural ? buildStructuralGraph(data) : buildNetworkGraph(data));

    const initEventListeners = () => {
      const nodes = document.querySelectorAll('#graph-area title');
      for (const resourcesOfKind of Object.keys(resourcesStore.current)) {
        for (const res of resourcesStore.current[resourcesOfKind]) {
          const node = [...nodes].find(n => n.textContent === res.metadata.uid)
            ?.parentNode;

          if (!node) continue;

          if (res.metadata.uid === resource.metadata.uid) {
            node.classList.add('root-node');
          } else {
            node.onclick = () => navigateToResource(res);
          }
        }
      }
    };

    setTimeout(() => {
      initEventListeners();
    }, 100);
  };

  const onRelatedResourcesRefresh = () => {
    // const data = {
    //   initialResource: resource,
    //   depth,
    //   context: {},
    //   store: resourcesStore.current,
    // };
    // setDot(isStructural ? buildStructuralGraph(data) : buildNetworkGraph(data));
    // console.log('fresh but does nothing');
    // setElements(
    //   buildStructuralGraph(resource, depth, {
    //     resources: resourcesStore.current,
    //     nodeCategories,
    //     namespaceNodes,
    //     t,
    //   }),
    // );
  };

  const [resourcesStore, startedLoading, startLoading] = useRelatedResources(
    resource,
    depth,
    {
      onAllLoaded,
      onRelatedResourcesRefresh,
    },
  );

  const actions = !startedLoading && (
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
      {startedLoading && dot && (
        <div id="graph-area">
          <Graphviz
            dot={dot}
            // https://github.com/magjac/d3-graphviz#selection_graphviz
            options={{
              height: '500px',
              width: '100%',
              zoom: true,
              useWorker: false,
            }}
          />
          <SaveGraphControls
            content={dot}
            name={`${resource.kind} ${resource.metadata.name}.gv`}
            i18n={i18n}
          />
        </div>
      )}
    </LayoutPanel>
  );
}
