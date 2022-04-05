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

  const onAllLoaded = () => {
    const initEventListeners = () => {
      for (const resourcesOfKind of Object.keys(resourcesStore.current)) {
        for (const res of resourcesStore.current[resourcesOfKind]) {
          const node = document.getElementById(res.metadata.uid);

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
      // wait until Graphviz renders the nodes
    }, 100);

    setReady(true);
  };

  const [resourcesStore, startedLoading, startLoading] = useRelatedResources({
    resource,
    config,
    events: {
      onRelatedResourcesRefresh: redraw,
      onAllLoaded,
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
