import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Function/Functions.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Function/Function.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Functions', namespaced: true },
);
