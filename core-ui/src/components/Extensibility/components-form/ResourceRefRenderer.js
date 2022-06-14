import React from 'react';
import { ExternalResourceRef } from 'shared/components/ResourceRef/ExternalResourceRef';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';

export function ResourceRefRender({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
  ...props
}) {
  const resourceType = schema.get('components') || 'secrets';

  const url = `/api/v1/${resourceType}`;

  const { data, loading } = useGetList()(url);
  return (
    <ExternalResourceRef
      value={value}
      resources={data}
      setValue={value => {
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value },
        });
      }}
      required={required}
      loading={loading}
    />
  );
}
