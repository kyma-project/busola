import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/AuthorizationPolicies.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/AuthorizationPolicies/AuthorizationPolicies.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'AuthorizationPolicies', namespaced: true },
);
