import React from 'react';
import { fromJS } from 'immutable';

import {
  useGetTranslation,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';
import { ResourceForm } from 'shared/ResourceForm';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';
import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';
import { usePermittedUrl } from 'hooks/usePermittedUrl';

import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

export function ResourceRenderer({
  onChange,
  onKeyDown,
  value = '',
  schema,
  storeKeys,
  required,
  compact,
  originalResource,
  singleRootResource,
  embedResource,
  ...props
}) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const { setVar } = useVariables();
  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource: embedResource,
    scope: value,
    value,
  });

  const { tFromStoreKeys, t: tExt } = useGetTranslation();

  const { group, version, kind, scope = 'cluster', namespace = namespaceId } =
    fromJS(schema.get('resource')).toJS() || {};
  const provideVar = schema.get('provideVar');

  const url = usePermittedUrl(
    group,
    version,
    kind,
    scope === 'namespace' ? namespace : null,
  );

  return (
    <ResourceForm.FormField
      label={tFromStoreKeys(storeKeys, schema)}
      input={() => (
        <K8sResourceSelectWithUseGetList
          data-testid={storeKeys.join('.') || tFromStoreKeys(storeKeys, schema)}
          url={url}
          filter={item => {
            if (schema.get('filter')) {
              const [value] = jsonata(schema.get('filter'), {
                item,
              });
              return value;
            } else return true;
          }}
          onSelect={(value, resources) => {
            const resource = (resources || []).find(
              r => r.metadata.name === value,
            );
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
          required={required}
          value={value}
          resourceType={kind}
        />
      )}
      compact={compact}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
