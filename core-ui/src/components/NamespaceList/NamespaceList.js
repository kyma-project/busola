import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { GET_NAMESPACES } from '../../queries/queries';
import { Spinner } from '@kyma-project/react-components';

export default function NamespaceList() {
  const { data, error, loading } = useQuery(GET_NAMESPACES);

  if (error) {
    return <p>Nie pykło</p>;
  }

  if (loading) {
    return <Spinner />;
  }

  return data.namespaces.map(namespace => <p>{namespace.name}</p>);
}
