import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/ConfigMaps.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/ConfigMap/ConfigMap.details'),
);

export default createResourceRoutes({
  List,
  Details,
  resourceType: 'ConfigMaps',
  namespaced: true,
});
