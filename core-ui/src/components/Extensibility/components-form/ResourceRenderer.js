import React from 'react';

import { getResourceUrl } from 'resources/Namespaces/YamlUpload/helpers';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useGetTranslation } from 'components/Extensibility/helpers';
import { ResourceForm } from 'shared/ResourceForm';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';
import { jsonataWrapper } from '../jsonataWrapper';

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
  const schemaRequired = schema.get('required');

  const url = getResourceUrl(
    {
      apiVersion: group ? `${group}/${version}` : version,
      kind,
    },
    scope === 'namespace' ? namespace : null,
  );

  let expression;
  if (schema.get('filter')) {
    expression = jsonataWrapper(schema.get('filter'));
    expression.assign('root', props?.resource);
  }

  return (
    <ResourceForm.FormField
      label={tFromStoreKeys(storeKeys, schema)}
      input={() => (
        <K8sResourceSelectWithUseGetList
          data-testid={storeKeys.join('.')}
          url={url}
          filter={item => {
            if (expression) {
              expression.assign('item', item);
              return expression.evaluate();
            } else return true;
          }}
          onSelect={value =>
            onChange({
              storeKeys,
              scopes: ['value'],
              type: 'set',
              schema,
              required,
              data: { value },
            })
          }
          value={value}
          resourceType={kind}
        />
      )}
      compact={compact}
      required={schemaRequired ?? required}
    />
  );
}
