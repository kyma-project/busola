import React from 'react';
import { Route } from 'react-router-dom';

const BusolaExtensionList = React.lazy(() =>
  import('components/BusolaExtensions/BusolaExtensionList'),
);
const BusolaExtensionDetails = React.lazy(() =>
  import('components/BusolaExtensions/BusolaExtensionDetails'),
);

export default (
  <>
    <Route path="/busolaextensions" element={<BusolaExtensionList />} />
    <Route
      path="/busolaextensions/details/:namespace/:name"
      element={<BusolaExtensionDetails />}
    />
  </>
);
