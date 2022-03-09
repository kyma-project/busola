import React from 'react';
import { createResourceRoutes } from 'routing/common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/ClusterRoles.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Roles/ClusterRoles.details'),
);

export default createResourceRoutes(
  { List, Details },
  { pathSegment: 'clusterroles', namespaced: false },
);
