import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/RoleBindings/RoleBindings.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/RoleBindings/RoleBindings.details'
  ),
);

export default createResourceRoutes({
  List,
  Details,
  resourceType: 'RoleBindings',
  namespaced: true,
});
