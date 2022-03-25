import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Services.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Service/Service.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Services', namespaced: true },
);
