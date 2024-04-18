import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import React, { Suspense } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
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
  const layoutState = useRecoilValue(columnLayoutState);
  const { clusterUrl } = useUrl();
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');

  // const { namespace, resourceName, resourceType } = useParams();
  const resourceName = layoutState?.midColumn?.resourceName;
  const resourceType = layoutState?.midColumn?.resourceType;
  const namespace = layoutState?.midColumn?.namespaceId;

  let startColumnComponent = null;

  // if ((!layout) && defaultColumn === 'details') {
  //   startColumnComponent = (
  //     <ExtensibilityDetails resourceName={name} namespaceId={namespace} />
  //   );
  // } else {
  //   startColumnComponent = <KymaModulesList />;
  // }

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
        resourceName={resourceName}
        namespaceId={namespace}
      />
    );
  }

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={<div className="column-content">{<KymaModulesList />}</div>}
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
