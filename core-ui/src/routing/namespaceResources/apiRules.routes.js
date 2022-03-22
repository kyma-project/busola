import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/ApiRules.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/ApiRule/ApiRules.details'),
);

export default createResourceRoutes(
  { List, Details },
  {
    resourceType: 'ApiRules',
    namespaced: true,
    resourceI18Key: 'api-rules.title',
  },
);
