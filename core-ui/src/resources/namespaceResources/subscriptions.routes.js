import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Subscription/Subscriptions.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/Subscriptions/Subscriptions.details'
  ),
);

export default createResourceRoutes({
  List,
  Details,
  resourceType: 'Subscriptions',
  namespaced: true,
});
