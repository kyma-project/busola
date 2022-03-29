import React from 'react';

import ServiceBindings from './ServiceBindings';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useGetBindingsCombined } from 'components/Lambdas/hooks/useGetBindingsCombined';

export default function ServiceBindingsWrapper({ lambda, isActive }) {
  const { serviceBindingsCombined, loading, error } = useGetBindingsCombined(
    lambda,
    isActive,
  );
  if (!serviceBindingsCombined && loading) {
    return <Spinner />;
  }
  return (
    <ServiceBindings
      lambda={lambda}
      serviceBindingsCombined={serviceBindingsCombined}
      serverDataError={error}
      serverDataLoading={loading}
    />
  );
}
