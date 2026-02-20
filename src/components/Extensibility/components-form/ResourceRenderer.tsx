import { fromJS } from 'immutable';

import {
  useGetTranslation,
  getPropsFromSchema,
  SchemaOnChangeParams,
} from 'components/Extensibility/helpers';
import { ResourceForm } from 'shared/ResourceForm';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';
import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';
import { usePermittedUrl } from 'hooks/usePermittedUrl';

import { useAtomValue } from 'jotai';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { StoreKeys, StoreSchemaType } from '@ui-schema/ui-schema';

type ResourceRendererProps = {
  onChange: (params: SchemaOnChangeParams) => void;
  value: any;
  schema: StoreSchemaType;
  storeKeys: StoreKeys;
  required: boolean;
  compact?: boolean;
  originalResource?: any;
  singleRootResource?: any;
  embedResource?: any;
};

export function ResourceRenderer({
  onChange,
  value = '',
  schema,
  storeKeys,
  required,
  compact,
  originalResource,
  singleRootResource,
  embedResource,
}: ResourceRendererProps) {
  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const { setVar } = useVariables() as {
    setVar: (path: string, value: any) => void;
  };
  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource: embedResource,
    scope: value,
  });

  const { tFromStoreKeys, t: tExt } = useGetTranslation();

  const {
    group,
    version,
    kind,
    scope = 'cluster',
    namespace = namespaceId,
  } = fromJS(schema.get('resource')).toJS() || {};
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
          filter={async (item: any) => {
            if (schema.get('filter')) {
              const [value] = await jsonata(schema.get('filter'), {
                item,
              });
              return value;
            } else return true;
          }}
          onSelect={(value: string, resources: any[]) => {
            const resource = (resources || []).find(
              (r) => r.metadata.name === value,
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
