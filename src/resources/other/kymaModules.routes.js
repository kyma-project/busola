import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { columnLayoutState } from 'state/columnLayoutAtom';

const KymaModulesList = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesList'),
);

const KymaModulesCreate = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesCreate'),
);

const KymaModulesAddModule = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesAddModule'),
);

const ColumnWraper = () => {
  const layoutState = useRecoilValue(columnLayoutState);

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={<div className="column-content">{<KymaModulesList />}</div>}
      midColumn={
        <div className="column-content">{<KymaModulesAddModule />}</div>
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
