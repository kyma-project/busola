import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/DNSEntries.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/DNSEntries.details'),
);

export default createResourceRoutes({
  List,
  Details,
  resourceType: 'DnsEntries',
  namespaced: true,
  resourceI18Key: 'dnsentries.title',
});
