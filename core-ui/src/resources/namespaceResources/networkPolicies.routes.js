import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/NetworkPolicies.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/NetworkPolicy/NetworkPolicy.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'NetworkPolicies', namespaced: true },
);
