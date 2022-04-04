import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Issuers.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Issuer/Issuer.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Issuers', namespaced: true },
);
