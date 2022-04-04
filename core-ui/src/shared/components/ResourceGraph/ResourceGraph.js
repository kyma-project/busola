import React, { useEffect, useState } from 'react';
import { Graphviz } from 'graphviz-react';

import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { navigateToResource } from 'shared/hooks/navigate';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useRelatedResources } from 'shared/components/ResourceGraph/useRelatedResources';
import { useIntersectionObserver } from 'shared/hooks/useIntersectionObserver';
import { buildGraph } from 'shared/components/ResourceGraph/buildGraph';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useTranslation } from 'react-i18next';
import { useMinWidth, TABLET } from 'hooks/useMinWidth';
import { LayoutPanel } from 'fundamental-react';
import { SaveGraphControls } from './SaveGraphControls';
import './ResourceGraph.scss';

function ResourceGraph({ resource, i18n, config }) {
  const { features } = useMicrofrontendContext();
  const { t } = useTranslation(['translation'], { i18n });
  const [dotSrc, setDotSrc] = useState('');
  const [isReady, setReady] = useState(false);

  const [graphEl, setGraphEl] = useState(null);
  const isTabletOrWider = useMinWidth(TABLET);
  const { hasBeenInView } = useIntersectionObserver(graphEl, {
    skip: !isTabletOrWider,
  });
  const redraw = () => {
    const data = {
      initialResource: resource,
      store: resourcesStore.current,
    };
    setDotSrc(buildGraph(data, config));
  };

  React.useEffect(() => {
    if (!setReady) return;

    const initEventListeners = () => {
      for (const resourcesOfKind of Object.keys(resourcesStore.current)) {
        for (const res of resourcesStore.current[resourcesOfKind]) {
          const node = document.getElementById(res.metadata.uid);
          if (!node) continue;

          // add status bar
          const nodePosition =
            [...node.children]
              .find(el => {
                return el.nodeName === 'polygon';
              })
              ?.getAttribute('points')
              ?.split(/[,\s]/)
              .map(x => parseFloat(x)) || [];

          if (nodePosition.length) {
            // the highest x coordinate from the opposite box vertexes
            const biggestX = Math.max(nodePosition[0], nodePosition[4]);

            // these are the y coordinates of the opposite box vertexes
            const y1 = nodePosition[1];
            const y2 = nodePosition[5];
            const smallestY = Math.min(y1, y2);
            const rangeY = Math.max(y1, y2) - smallestY;

            const rect = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'rect',
            );
            rect.setAttribute('x', biggestX.toString());
            rect.setAttribute('y', smallestY.toString());
            rect.setAttribute('width', '5');
            rect.setAttribute('height', rangeY.toString());
            rect.setAttribute('fill', 'orange');
            rect.classList.add(
              'resource_status',
              `resource_status_${res.metadata.uid}`,
            );

            node.appendChild(rect);
          }

          if (res.metadata.uid === resource.metadata.uid) {
            node.classList.add('root-node');
          } else {
            node.onclick = () => navigateToResource(res);
          }
        }
      }
    };
    initEventListeners();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, resource]);

  React.useLayoutEffect(() => {
    return () => {
      const statuses = document.querySelectorAll('.resource_status');
      statuses.forEach(box => {
        box.remove();
      });
    };
  }, [resource]);

  const [resourcesStore, startedLoading, startLoading] = useRelatedResources({
    resource,
    config,
    events: {
      onRelatedResourcesRefresh: redraw,
      onAllLoaded: a => {
        setReady(true);
      },
    },
  });
  useEffect(() => {
    if (hasBeenInView) {
      startLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBeenInView]);
  if (!features.VISUAL_RESOURCES?.isEnabled) {
    return '';
  }

  const actions = !startedLoading && null;

  if (!isTabletOrWider) {
    return null;
  }
  return (
    <LayoutPanel
      className="fd-margin--md resource-graph"
      ref={node => {
        setGraphEl(node);
      }}
    >
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('resource-graph.title')} />
        {actions}
      </LayoutPanel.Header>
      {startedLoading && dotSrc ? (
        <LayoutPanel.Body>
          <ErrorBoundary i18n={i18n} customMessage={t('resource-graph.error')}>
            <div id="graph-area">
              <Graphviz
                dot={dotSrc}
                // https://github.com/magjac/d3-graphviz#selection_graphviz
                options={{
                  height: '100%',
                  width: '100%',
                  zoom: isReady, // if always true, then the graph will jump on first pan or zoom
                  useWorker: false,
                }}
              />
              <SaveGraphControls
                content={dotSrc}
                // .gv extension is preferred instead of .dot
                name={`${resource.kind} ${resource.metadata.name}.gv`}
                i18n={i18n}
              />
            </div>
          </ErrorBoundary>
        </LayoutPanel.Body>
      ) : (
        <div className="loader">
          <Spinner />
        </div>
      )}
    </LayoutPanel>
  );
}
export default ResourceGraph;
