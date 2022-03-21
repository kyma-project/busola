import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Namespaces.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Namespace/Namespace.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'namespaces', namespaced: false },
);
