import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/PersistentVolumes.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/PersistentVolume/PersistentVolumes.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'PersistentVolumes', namespaced: false },
);
