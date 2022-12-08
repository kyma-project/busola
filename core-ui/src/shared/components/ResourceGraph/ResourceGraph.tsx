import React, { useEffect, useState } from 'react';
import { MemoizedGraphviz } from './GraphvizComponent';

import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

import { useRelatedResources } from 'shared/components/ResourceGraph/useRelatedResources';
import { useIntersectionObserver } from 'shared/hooks/useIntersectionObserver';
import { buildGraph } from 'shared/components/ResourceGraph/buildGraph';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useTranslation } from 'react-i18next';
import { useMinWidth, TABLET } from 'hooks/useMinWidth';
import { LayoutPanel } from 'fundamental-react';
import { SaveGraphControls } from './SaveGraphControls';
import { DetailsCard } from './DetailsCard/DetailsCard';
import './ResourceGraph.scss';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useFeature } from 'hooks/useFeature';
import { K8sResource } from 'types';
import { ResourceGraphConfig } from './types';

function ResourceGraph({
  resource,
  config,
}: {
  resource: K8sResource;
  config: ResourceGraphConfig;
}) {
  const { t } = useTranslation();
  const [dotSrc, setDotSrc] = useState('');
  const [isReady, setReady] = useState(false);
  const [graphEl, setGraphEl] = useState<HTMLElement | null>(null);
  const [clickedResource, setClickedResource] = useState<K8sResource | null>(
    null,
  );
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
        for (const res of resourcesStore.current[resourcesOfKind] || []) {
          const node = document.getElementById(res.metadata.uid);

          if (!node) continue;

          node.onclick = () => setClickedResource(res);
        }
      }
    };

    setTimeout(() => {
      initEventListeners();
      // wait until Graphviz renders the nodes
    }, 100);

    setReady(true);
  };

  const {
    store: resourcesStore,
    startedLoading,
    startLoading,
  } = useRelatedResources({
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
  if (!useFeature('VISUAL_RESOURCES')?.isEnabled) {
    return EMPTY_TEXT_PLACEHOLDER;
  }

  const actions = !startedLoading && null;

  if (!isTabletOrWider) {
    return null;
  }
  return (
    <LayoutPanel
      className="fd-margin--md resource-graph"
      ref={(node: any) => setGraphEl(node)}
    >
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('resource-graph.title')} />
        {actions}
      </LayoutPanel.Header>
      {startedLoading && dotSrc ? (
        <LayoutPanel.Body>
          <ErrorBoundary customMessage={t('resource-graph.error')}>
            <div id="graph-area">
              <MemoizedGraphviz dotSrc={dotSrc} isReady={isReady} />
              <SaveGraphControls
                content={dotSrc}
                // .gv extension is preferred instead of .dot
                name={`${resource.kind} ${resource.metadata.name}.gv`}
              />
              {clickedResource ? (
                <DetailsCard
                  resource={clickedResource}
                  handleCloseCard={() => setClickedResource(null)}
                />
              ) : null}
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
