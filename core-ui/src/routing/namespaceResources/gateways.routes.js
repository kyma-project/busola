import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Gateways.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Gateway/Gateway.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Gateways', namespaced: true },
);
