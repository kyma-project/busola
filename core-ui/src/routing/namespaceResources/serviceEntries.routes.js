import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/ServiceEntries.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/ServiceEntries/ServiceEntries.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'ServiceEntries', namespaced: true },
);
