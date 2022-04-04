import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/CronJobs.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/CronJobs/CronJob.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'CronJobs', namespaced: true },
);
