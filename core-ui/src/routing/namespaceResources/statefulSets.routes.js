import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/StatefulSets.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/StatefulSet/StatefulSets.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'StatefulSets', namespaced: true },
);
