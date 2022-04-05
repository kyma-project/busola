import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/DaemonSets.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/DaemonSet/DaemonSet.details'),
);

export default createResourceRoutes({
  List,
  Details,
  resourceType: 'DaemonSets',
  namespaced: true,
});
