import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/DestinationRules.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/DestinationRule/DestinationRule.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'DestinationRules', namespaced: true },
);
