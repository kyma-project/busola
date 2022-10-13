import React from 'react';
import pluralize from 'pluralize';
import { fromJS } from 'immutable';

import { getObjectValueWorkaround } from 'components/Extensibility/helpers';
import { ExternalResourceRef } from 'shared/components/ResourceRef/ExternalResourceRef';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useGetTranslation } from 'components/Extensibility/helpers';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';

export function ResourceRefRender({
  onChange,
  value,
  schema,
  storeKeys,
  resource,
  widgets,
  originalResource,
  ...props
}) {
  const jsonata = useJsonata({
    resource: originalResource,
    scope: value,
    value,
  });
  const { tFromStoreKeys } = useGetTranslation();
  // TODO the value obtained by ui-schema is undefined for this component
  value = getObjectValueWorkaround(schema, resource, storeKeys, value);

  const { WidgetRenderer } = widgets;
  const ownSchema = schema.delete('widget');

  const schemaResource = schema.get('resource') || {};
  const toInternal = schema.get('toInternal');
  const toExternal = schema.get('toExternal');
  const provideVar = schema.get('provideVar');
  const defaultOpen = schema.get('defaultExpanded');

  if (toInternal) {
    const [internal, error] = jsonata(toInternal);
    value = error ? {} : internal;
  }

  const group = (schemaResource?.group || '').toLowerCase();
  const version = schemaResource?.version;
  const resourceType = pluralize(schemaResource?.kind || '')?.toLowerCase();
  const groupPrefix = group ? `apis/${group}` : 'api';
  const url = `/${groupPrefix}/${version}/${resourceType}`;

  const { data, loading, error } = useGetList()(url);

  const { setVar } = useVariables();

  return (
    <ExternalResourceRef
      defaultOpen={defaultOpen}
      title={tFromStoreKeys(storeKeys, schema)}
      value={fromJS(value).toJS() || ''}
      resources={data}
      setValue={value => {
        if (toExternal) {
          const [external, error] = jsonata(toExternal, {
            scope: value,
            value,
          });
          value = error ? {} : external;
        }
        const resource = data.find(
          res =>
            res.metadata.namespace === value.namespace &&
            res.metadata.name === value.name,
        );
        if (provideVar) setVar(`$.${provideVar}`, resource);

        onChange({
          storeKeys: storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required: true,
          data: { value: fromJS(value) },
        });
      }}
      required
      loading={loading}
      error={error}
    >
      {schema.get('type') === 'object' && (
        <WidgetRenderer
          {...props}
          storeKeys={storeKeys}
          schema={ownSchema}
          widgets={widgets}
        />
      )}
    </ExternalResourceRef>
  );
}
