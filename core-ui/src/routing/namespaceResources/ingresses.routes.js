import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Ingresses.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Ingress/Ingress.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Ingresses', namespaced: true },
);
