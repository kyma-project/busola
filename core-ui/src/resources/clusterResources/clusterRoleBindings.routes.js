import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import(
    '../../components/Predefined/List/RoleBindings/ClusterRoleBindings.list'
  ),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/RoleBindings/RoleBindings.details'
  ),
);

export default createResourceRoutes({
  List,
  Details,
  resourceType: 'ClusterRoleBindings',
  namespaced: false,
});
