import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Function/Functions.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Function.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Functions', namespaced: true },
);
