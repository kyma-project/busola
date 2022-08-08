import React from 'react';
import { ExternalResourceRef } from 'shared/components/ResourceRef/ExternalResourceRef';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import pluralize from 'pluralize';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { getObjectValueWorkaround } from 'components/Extensibility/helpers';

export function ResourceRefRender({
  onChange,
  value,
  schema,
  storeKeys,
  required,
  resource,
}) {
  // TODO the value obtained by ui-schema is undefined for this component
  value = getObjectValueWorkaround(schema, resource, storeKeys, value);

  const schemaResource = schema.get('resource') || {};
  const group = (schemaResource?.group || '').toLowerCase();
  const version = schemaResource?.version;
  const resourceType = pluralize(schemaResource?.kind || '').toLowerCase();
  const groupPrefix = group ? `apis/${group}` : 'api';
  const url = `/${groupPrefix}/${version}/${resourceType}`;

  const { data, loading, error } = useGetList()(url);

  return (
    <ExternalResourceRef
      value={value.toJS()}
      resources={data}
      setValue={value => {
        onChange({
          storeKeys: storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value: createOrderedMap(value) },
        });
      }}
      required={required}
      loading={loading}
      error={error}
    />
  );
}
