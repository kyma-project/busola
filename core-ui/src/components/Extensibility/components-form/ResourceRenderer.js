import React from 'react';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { getResourceUrl } from 'resources/Namespaces/YamlUpload/helpers';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useGetTranslation } from 'components/Extensibility/helpers';
import * as Inputs from 'shared/ResourceForm/inputs';
import { ResourceForm } from 'shared/ResourceForm';

export function ResourceRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
  compact,
  ...props
}) {
  const { namespaceId } = useMicrofrontendContext();

  const { tFromStoreKeys } = useGetTranslation();
  const { group, version, kind, scope = 'cluster', namespace = namespaceId } =
    schema.get('resource') || {};

  const url = getResourceUrl(
    {
      apiVersion: group ? `${group}/${version}` : version,
      kind,
    },
    scope === 'namespace' ? namespace : null,
  );

  const { data } = useGetList()(url);

  const options = (data || []).map(res => ({
    key: res.metadata.name,
    text: res.metadata.name,
  }));

  return (
    <ResourceForm.FormField
      value={value}
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
      label={tFromStoreKeys(storeKeys, schema)}
      data-testid={storeKeys.join('.')}
      input={Inputs.ComboboxInput}
      options={options}
      compact={compact}
      required={required}
    />
  );
}
