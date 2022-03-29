import React from 'react';
import { createResourceRoutes } from 'routing/createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/Addons/AddonsConfigurations.list'),
);
const Details = React.lazy(() =>
  import(
    '../../components/Predefined/Details/Addons/AddonsConfigurationNamespace.details'
  ),
);

export default createResourceRoutes(
  { List, Details },
  { resourceType: 'AddonsConfigurations', namespaced: true },
);
