import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const BusolaExtensionList = React.lazy(() =>
  import('components/BusolaExtensions/BusolaExtensionList'),
);
const BusolaExtensionDetails = React.lazy(() =>
  import('components/BusolaExtensions/BusolaExtensionDetails'),
);

// function RoutedCustomResourcesOfType() {
// const { crdName, namespaceId } = useParams();

// return (
// <Suspense fallback={<Spinner />}>
// <CustomResourcesOfType crdName={crdName} namespace={namespaceId} />
// </Suspense>
// );
// }

export default (
  <>
    <Route
      //details/kube-public/alertmanagerconfigs.monitoring.coreos.com
      path="/busolaextensions/details/:namespace/:name"
      element={<BusolaExtensionDetails />}
    />
    <Route path="/busolaextensions" element={<BusolaExtensionList />} />
    {/*
    <Route
      path="/busolaextensions/:namespace"
      // element={<RoutedCustomResourcesOfT\ype />}
      element={<BusolaExtensionDetails />}
    />
    */}
  </>
);
