import React from 'react';
import { createResourceRoutes } from '../common';

const List = React.lazy(() =>
  import('../../components/Predefined/List/DNSProviders.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/DNSProviders.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'DnsProviders', namespaced: true },
);
