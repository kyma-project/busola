import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/CustomResourceDefinitions.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/CustomResourceDefinitions/CustomResourceDefinitions.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'CustomResourceDefinitions', namespaced: true },
);
