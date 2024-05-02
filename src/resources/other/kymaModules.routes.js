import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import React, { Suspense, useEffect } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import ExtensibilityDetails from 'components/Extensibility/ExtensibilityDetails';

const KymaModulesList = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesList'),
);

const KymaModulesAddModule = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesAddModule'),
);

const ColumnWraper = (defaultColumn = 'list') => {
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { clusterUrl } = useUrl();
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');
  const { resourceName, resourceType, namespace } = useParams();
  const initialLayoutState = layout
    ? {
        layout: layout ? layout : layoutState?.layout,
        midColumn: {
          resourceName: resourceName,
          resourceType: resourceType,
          namespaceId: namespace,
        },
        endColumn: null,
      }
    : null;

  useEffect(() => {
    if (layout && resourceName && resourceType) {
      setLayoutColumn(initialLayoutState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, namespace, resourceName, resourceType]);

  let startColumnComponent = null;

  if (!layout && defaultColumn === 'details') {
    startColumnComponent = (
      <ExtensibilityDetails
        layoutCloseCreateUrl={clusterUrl('kymamodules')}
        resourceName={layoutState?.midColumn?.resourceName || resourceName}
        resourceType={layoutState?.midColumn?.resourceType || resourceType}
        namespaceId={layoutState?.midColumn?.namespaceId || namespace}
      />
    );
  } else {
    startColumnComponent = <KymaModulesList />;
  }

  let midColumnComponent = null;
  if (layoutState?.showCreate?.resourceType) {
    midColumnComponent = (
      <ResourceCreate
        title={'Add Modules'}
        confirmText={'Save'}
        layoutCloseCreateUrl={clusterUrl('kymamodules')}
        renderForm={renderProps => {
          return (
            <ErrorBoundary>
              <KymaModulesAddModule {...renderProps} />
            </ErrorBoundary>
          );
        }}
      />
    );
  }
  if (!layoutState?.showCreate && layoutState?.midColumn) {
    midColumnComponent = (
      <ExtensibilityDetails
        layoutCloseCreateUrl={clusterUrl('kymamodules')}
        resourceName={layoutState?.midColumn?.resourceName || resourceName}
        resourceType={layoutState?.midColumn?.resourceType || resourceType}
        namespaceId={layoutState?.midColumn?.namespaceId || namespace}
      />
    );
  }

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={<div className="column-content">{startColumnComponent}</div>}
      midColumn={<div className="column-content">{midColumnComponent}</div>}
    />
  );
};

export default (
  <>
    <Route
      path={'kymamodules'}
      element={
        <Suspense fallback={<Spinner />}>
          <ColumnWraper />
        </Suspense>
      }
    />
    <Route
      path="kymamodules/namespaces/:namespace/:resourceType/:resourceName"
      element={<ColumnWraper defaultColumn="details" />}
    />
    <Route
      path="kymamodules/:resourceType/:resourceName"
      element={<ColumnWraper defaultColumn="details" />}
    />
  </>
);
