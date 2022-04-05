import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Events.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Events.details'),
);

export default createResourceRoutes({
  List,
  Details,
  resourceType: 'Events',
  namespaced: true,
});
