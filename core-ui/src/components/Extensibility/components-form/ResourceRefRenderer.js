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
  // TODO the value obtained by ui-schema is undefined for this component
  const backupValueFromResource = storeKeys
    .toArray()
    .reduce((valueSoFar, currKey) => {
      return valueSoFar[currKey];
    }, props.resource);

  const group = (schema.get('group') || '').toLowerCase();
  const version = schema.get('version');
  const resourceType = pluralize(schema.get('kind') || '').toLowerCase();
  const groupPrefix = group ? `apis/${group}` : 'api';
  const url = `/${groupPrefix}/${version}/${resourceType}`;

  const { data, loading, error } = useGetList()(url);

  return (
    <ExternalResourceRef
      value={value || backupValueFromResource}
      resources={data}
      setValue={value => {
        onChange({
          storeKeys: storeKeys,
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
