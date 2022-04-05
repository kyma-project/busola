import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Roles.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Roles/Roles.details'),
);

export default createResourceRoutes({
  List,
  Details,
  resourceType: 'Roles',
  namespaced: true,
});
