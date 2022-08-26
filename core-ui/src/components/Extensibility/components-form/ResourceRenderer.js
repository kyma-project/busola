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

  function changeValue(value) {
    onChange({
      storeKeys,
      scopes: ['value'],
      type: 'set',
      schema,
      required,
      data: { value },
    });
  }

  return (
    <ResourceForm.FormField
      label={tFromStoreKeys(storeKeys, schema)}
      data-testid={storeKeys.join('.')}
      input={() => (
        <K8sResourceSelectWithUseGetList
          url={url}
          filter={item => {
            if (expression) {
              expression.assign('item', item);
              return expression.evaluate();
            } else return true;
          }}
          onChange={value => changeValue(value)}
          onSelect={value => changeValue(value)}
          value={value}
          resourceType={kind}
        />
      )}
      compact={compact}
      required={schemaRequired ?? required}
    />
  );
}
