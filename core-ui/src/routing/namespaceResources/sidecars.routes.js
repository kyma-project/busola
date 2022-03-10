import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Sidecars.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Sidecars/Sidecars.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Sidecars', namespaced: true },
);
