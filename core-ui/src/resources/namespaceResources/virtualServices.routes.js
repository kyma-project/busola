import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/VirtualServices.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/VirtualServices/VirtualServices.details'
  ),
);

export default createResourceRoutes({
  List,
  Details,
  resourceType: 'VirtualServices',
  namespaced: true,
});
