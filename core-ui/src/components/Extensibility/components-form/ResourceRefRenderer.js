import React from 'react';
import { ExternalResourceRef } from 'shared/components/ResourceRef/ExternalResourceRef';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import pluralize from 'pluralize';

export function ResourceRefRender({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
  ...props
}) {
  const resourceType = pluralize(schema.get('kind') || '').toLowerCase();

  const url = `/api/v1/${resourceType}`;

  const { data, loading, error } = useGetList()(url);
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
      error={error}
    />
  );
}
