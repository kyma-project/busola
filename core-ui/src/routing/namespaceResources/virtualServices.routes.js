import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/VirtualServices.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/VirtualServices/VirtualServices.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { pathSegment: 'virtualservices', namespaced: true },
);
