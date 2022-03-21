import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/OAuth2Clients.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/OAuth2Clients/OAuth2Clients.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  {
    resourceType: 'OAuth2Clients',
    namespaced: true,
    resourceI18Key: 'oauth2-clients.title',
  },
);
