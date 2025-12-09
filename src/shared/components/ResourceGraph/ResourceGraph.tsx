import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRelatedResources } from 'shared/components/ResourceGraph/useRelatedResources';
import { useIntersectionObserver } from 'shared/hooks/useIntersectionObserver';

import { MemoizedGraphviz } from './GraphvizComponent';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { buildGraph } from 'shared/components/ResourceGraph/buildGraph';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { TABLET, useMinWidth } from 'hooks/useMinWidth';
import { SaveGraphControls } from './SaveGraphControls';
import { DetailsCard } from './DetailsCard/DetailsCard';
import { K8sResource } from 'types';
import { ResourceGraphConfig } from './types';
import { Panel, Title } from '@ui5/webcomponents-react';
import { Toolbar } from '@ui5/webcomponents-react-compat/dist/components/Toolbar/index.js';
import { ToolbarSpacer } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSpacer/index.js';

import './ResourceGraph.scss';

export default function ResourceGraph({
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
    buildGraph(data, config).then((res) => setDotSrc(res));
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

  const actions = !startedLoading && null;

  if (!isTabletOrWider) {
    return null;
  }
  return (
    <Panel
      fixed
      className="card-shadow sap-margin-small"
      ref={(node: any) => setGraphEl(node)}
      accessibleName="Resource graph panel"
      header={
        <Toolbar>
          <Title level="H5">{t('resource-graph.title')}</Title>
          {actions && (
            <>
              <ToolbarSpacer />
              {actions}
            </>
          )}
        </Toolbar>
      }
    >
      {startedLoading && dotSrc ? (
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
      ) : (
        <div className="loader">
          <Spinner />
        </div>
      )}
    </Panel>
  );
}
