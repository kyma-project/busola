import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Jobs.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/Job/Job.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'Jobs', namespaced: true },
);
