import React from 'react';

const List = React.lazy(() => import('./NamespacesList'));
const Details = React.lazy(() => import('./NamespacesDetails'));

const resource = {
  List,
  Details,
  resourceType: 'namespaces',
  namespaced: false,
};
export default resource;
