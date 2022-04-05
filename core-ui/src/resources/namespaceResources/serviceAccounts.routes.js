import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import(
    '../../components/Predefined/List/ServiceAccount/ServiceAccounts.list'
  ),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/ServiceAccount/ServiceAccount.details'
  ),
);

export default createResourceRoutes({
  List,
  Details,
  resourceType: 'ServiceAccounts',
  namespaced: true,
});
