import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Certificates.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Certificate/Certificate.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Certificates', namespaced: true },
);
