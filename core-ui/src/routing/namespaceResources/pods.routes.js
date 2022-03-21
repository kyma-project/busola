import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Pod/Pods.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Pod/Pod.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Pods', namespaced: true },
);
