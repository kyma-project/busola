import React from 'react';
import { createResourceRoutes } from '../createResourceRoutes';

const List = React.lazy(() =>
  import('../../components/Predefined/List/CustomResourceDefinitions.list'),
);

// Details are not listed intentionally. For some reason React Router interprets namespaced CRD details as cluster CRD details, despite correct URLs.
export default createResourceRoutes({
  List,
  resourceType: 'CustomResourceDefinitions',
  namespaced: true,
});
