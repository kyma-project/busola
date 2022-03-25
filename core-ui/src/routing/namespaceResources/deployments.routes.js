import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Deployments.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Deployment/Deployment.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Deployments', namespaced: true },
);
