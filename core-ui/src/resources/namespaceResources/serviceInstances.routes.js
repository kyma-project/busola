import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/ServiceInstances.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/ServiceInstance/ServiceInstance.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'ServiceInstances', namespaced: true },
);
