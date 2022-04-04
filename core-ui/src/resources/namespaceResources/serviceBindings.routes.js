import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/ServiceBindings.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/ServiceBinding/ServiceBinding.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'ServiceBindings', namespaced: true },
);
