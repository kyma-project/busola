import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { Spinner } from 'shared/components/Spinner/Spinner';

const ServiceCatalogUI = React.lazy(() => import('./components/App/App'));

const ServiceCatalogUiWrapper = () => {
  const { cluster } = useMicrofrontendContext();

  return (
    // force rerender on cluster change
    <Routes key={cluster?.name}>
      <Route
        path="/catalog*"
        element={
          <Suspense fallback={<Spinner />}>
            <ServiceCatalogUI id="catalog" />
          </Suspense>
        }
      />
      <Route
        path="/instances*"
        element={
          <Suspense fallback={<Spinner />}>
            <ServiceCatalogUI id="instances" />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default ServiceCatalogUiWrapper;
