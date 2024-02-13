import { Route } from 'react-router-dom';

import { ColumnWrapper } from './CustomResourcesByGroup.routes';

export default (
  <Route
    path="customresources/:crdName/:crName"
    element={<ColumnWrapper defaultColumn="details" />}
  />
);
