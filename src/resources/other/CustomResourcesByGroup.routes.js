import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const CustomResourcesByGroup = React.lazy(() =>
  import('../../components/CustomResources/CustomResourcesByGroup'),
);

export default (
  <Route
    path="customresources"
    element={
      <Suspense fallback={<Spinner />}>
        <CustomResourcesByGroup />
      </Suspense>
    }
  />
);
