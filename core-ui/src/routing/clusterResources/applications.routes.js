import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Application/Applications.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Application/Application.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Applications', namespaced: false },
);
