import React from 'react';
import { ExternalResourceRef } from 'shared/components/ResourceRef/ExternalResourceRef';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import pluralize from 'pluralize';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { getObjectValueWorkaround } from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';

export function ResourceRefRender({
  onChange,
  value,
  schema,
  storeKeys,
  resource,
}) {
  const { t } = useTranslation();
  // TODO the value obtained by ui-schema is undefined for this component
  value = getObjectValueWorkaround(schema, resource, storeKeys, value);

  const schemaResource = schema.get('resource') || {};
  const group = (schemaResource?.group || '').toLowerCase();
  const version = schemaResource?.version;
  const resourceType = pluralize(schemaResource?.kind || '')?.toLowerCase();
  const groupPrefix = group ? `apis/${group}` : 'api';
  const url = `/${groupPrefix}/${version}/${resourceType}`;

  const { data, loading, error } = useGetList()(url);

  return (
    <ExternalResourceRef
      title={t('extensibility.widgets.resource-ref.header')}
      value={value.toJS()}
      resources={data}
      setValue={value => {
        onChange({
          storeKeys: storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required: true,
          data: { value: createOrderedMap(value) },
        });
      }}
      required
      loading={loading}
      error={error}
    />
  );
}
