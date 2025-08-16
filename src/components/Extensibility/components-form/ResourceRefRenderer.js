import React, { useEffect, useState } from 'react';
import pluralize from 'pluralize';
import { fromJS } from 'immutable';

import { getObjectValueWorkaround } from 'components/Extensibility/helpers';
import { ExternalResourceRef } from 'shared/components/ResourceRef/ExternalResourceRef';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useGetTranslation } from 'components/Extensibility/helpers';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';
import { useUrl } from 'hooks/useUrl';
import { usePermittedUrl } from 'hooks/usePermittedUrl';

export function ResourceRefRender({
  onChange,
  value,
  schema,
  storeKeys,
  resource,
  widgets,
  required,
  originalResource,
  nestingLevel,
  singleRootResource,
  embedResource,
  ...props
}) {
  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource: embedResource,
    scope: value,
    value,
  });
  const { namespace } = useUrl();
  const { tFromStoreKeys } = useGetTranslation();
  // TODO the value obtained by ui-schema is undefined for this component
  value = getObjectValueWorkaround(schema, resource, storeKeys, value);

  const { WidgetRenderer } = widgets;
  const ownSchema = schema.delete('widget');

  const schemaResource = schema.get('resource') || {};
  const toInternal = schema.get('toInternal');
  const toExternal = schema.get('toExternal');
  const provideVar = schema.get('provideVar');
  const defaultOpen = schema.get('defaultExpanded') ?? false;
  const filter = schema.get('filter');

  if (toInternal) {
    jsonata(toInternal).then(([internal, error]) => {
      value = error ? {} : internal;
    });
  }

  const group = (schemaResource?.group || '').toLowerCase();
  const version = schemaResource?.version;
  const resourceType = pluralize(schemaResource?.kind || '')?.toLowerCase();
  const url = usePermittedUrl(group, version, resourceType);
  const { data, loading, error } = useGetList()(url, {
    skip: !url,
  });

  const { setVar } = useVariables();
  const [resources, setResources] = useState([]);

  useEffect(() => {
    Promise.all(
      (data || []).map(async res => {
        if (filter) {
          const [value] = await jsonata(filter, { item: res });
          return value;
        }
        return true;
      }),
    ).then(results => {
      setResources(results.filter(Boolean));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filter]);

  const setValue = async value => {
    if (toExternal) {
      const [external, error] = await jsonata(toExternal, {
        scope: value,
        value,
      });
      value = error ? {} : external;
    }
    const resource = (data ?? []).find(
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
  };

  return (
    <ExternalResourceRef
      defaultOpen={defaultOpen}
      defaultNamespace={namespace}
      title={tFromStoreKeys(storeKeys, schema)}
      value={fromJS(value).toJS() || ''}
      resources={resources}
      setValue={setValue}
      required={required}
      loading={loading || !url}
      error={error}
      nestingLevel={nestingLevel}
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
