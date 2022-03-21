import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/ServiceBrokers.list'),
);

export default createResourceRoutes(
  { List },
  { resourceType: 'ServiceBrokers', namespaced: true },
);
