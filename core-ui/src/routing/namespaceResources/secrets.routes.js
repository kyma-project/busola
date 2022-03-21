import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Secrets.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Secret/Secret.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Secrets', namespaced: true },
);
