import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Spinner } from 'react-shared';

const Preferences = React.lazy(() =>
  import('../../components/Preferences/Preferences'),
);

export default (
  <Route
    path={'/preferences'}
    element={
      <Suspense fallback={<Spinner />}>
        <Preferences />
      </Suspense>
    }
  />
);
