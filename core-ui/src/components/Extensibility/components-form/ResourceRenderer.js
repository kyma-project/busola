import React from 'react';

import { getResourceUrl } from 'resources/Namespaces/YamlUpload/helpers';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import {
  useGetTranslation,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';
import { ResourceForm } from 'shared/ResourceForm';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';
import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';

export function ResourceRenderer({
  onChange,
  onKeyDown,
  value = '',
  schema,
  storeKeys,
  required,
  compact,
  originalResource,
  ...props
}) {
  const { namespaceId } = useMicrofrontendContext();
  const { setVar } = useVariables();
  const jsonata = useJsonata({
    resource: originalResource,
    scope: value,
    value,
  });

  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const { group, version, kind, scope = 'cluster', namespace = namespaceId } =
    schema.get('resource') || {};
  const provideVar = schema.get('provideVar');

  const url = getResourceUrl(
    {
      apiVersion: group ? `${group}/${version}` : version,
      kind,
    },
    scope === 'namespace' ? namespace : null,
  );

  return (
    <ResourceForm.FormField
      label={tFromStoreKeys(storeKeys, schema)}
      input={() => (
        <K8sResourceSelectWithUseGetList
          data-testid={storeKeys.join('.')}
          url={url}
          filter={item => {
            if (schema.get('filter')) {
              const [value] = jsonata(schema.get('filter'), { scope: item });
              return value;
            } else return true;
          }}
          onSelect={(value, resources) => {
            const resource = resources.find(r => r.metadata.name === value);
            if (provideVar && resource) setVar(`$.${provideVar}`, resource);

            onChange({
              storeKeys,
              scopes: ['value'],
              type: 'set',
              schema,
              required,
              data: { value },
            });
          }}
          value={value}
          resourceType={kind}
        />
      )}
      compact={compact}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
