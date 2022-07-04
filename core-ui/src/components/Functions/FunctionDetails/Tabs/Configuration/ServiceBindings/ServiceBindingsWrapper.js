import React from 'react';

import ServiceBindings from './ServiceBindings';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useGetBindingsCombined } from 'components/Functions/hooks/useGetBindingsCombined';

export default function ServiceBindingsWrapper({ func, isActive }) {
  const { serviceBindingsCombined, loading, error } = useGetBindingsCombined(
    func,
    isActive,
  );
  if (!serviceBindingsCombined && loading) {
    return <Spinner />;
  }
  return (
    <ServiceBindings
      func={func}
      serviceBindingsCombined={serviceBindingsCombined}
      serverDataError={error}
      serverDataLoading={loading}
    />
  );
}
