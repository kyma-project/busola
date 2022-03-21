import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/ReplicaSets.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/ReplicaSet/Replicaset.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'ReplicaSets', namespaced: true },
);
