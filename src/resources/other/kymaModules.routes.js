import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';

const KymaModulesList = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesList'),
);

const KymaModulesAddModule = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesAddModule'),
);

const ColumnWraper = () => {
  const layoutState = useRecoilValue(columnLayoutState);
  const { clusterUrl } = useUrl();

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={<div className="column-content">{<KymaModulesList />}</div>}
      midColumn={
        <div className="column-content">
          {
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
          }
        </div>
      }
    />
  );
};

export default (
  <Route
    path={'kymamodules'}
    element={
      <Suspense fallback={<Spinner />}>
        <ColumnWraper />
      </Suspense>
    }
  />
);
