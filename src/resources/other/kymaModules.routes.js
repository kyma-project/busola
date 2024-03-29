import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const KymaModulesList = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesList'),
);

export default (
  <Route
    path={'kymamodules'}
    element={
      <Suspense fallback={<Spinner />}>
        <KymaModulesList />
      </Suspense>
    }
  />
);
