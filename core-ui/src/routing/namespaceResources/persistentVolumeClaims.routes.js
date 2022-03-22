import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/PersistentVolumeClaims.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/PersistentVolumeClaims/PersistentVolumeClaims.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'PersistentVolumeClaims', namespaced: true },
);
