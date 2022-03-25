import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/HPA.list'),
);
const Details = React.lazy(() =>
  import('../../components/Predefined/Details/HPA/HPA.details'),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'HorizontalPodAutoscalers', namespaced: true },
);
