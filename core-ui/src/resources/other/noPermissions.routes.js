import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const NoPermissions = React.lazy(() =>
  import('../../components/NoPermissions/NoPermissions'),
);

export default (
  <Route
    path={'/no-permissions'}
    element={
      <Suspense fallback={<Spinner />}>
        <NoPermissions />
      </Suspense>
    }
  />
);
