import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import(
    '../../components/Predefined/List/Addons/clusterAddonsConfiguration.list'
  ),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/Addons/AddonsConfigurationCluster.details'
  ),
);

export default createResourceRoutes({
  List,
  Details,
  resourceType: 'ClusterAddonsConfigurations',
  namespaced: false,
});
