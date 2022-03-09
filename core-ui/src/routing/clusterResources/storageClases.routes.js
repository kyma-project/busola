import React from 'react';
import { createResourceRoutes } from 'routing/common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/StorageClasses.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/StorageClasses/StorageClasses.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { pathSegment: 'storageclasses', namespaced: false },
);
