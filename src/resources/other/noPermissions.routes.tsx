import { Suspense } from 'react';
import { Route } from 'react-router';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

const NoPermissions = lazyWithRetries(
  () => import('../../components/NoPermissions/NoPermissions'),
);

export default (
  <Route
    path={'no-permissions'}
    element={
      <Suspense fallback={<Spinner />}>
        <NoPermissions />
      </Suspense>
    }
  />
);
