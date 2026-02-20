import { List } from 'immutable';
import jp from 'jsonpath';

import { K8sNameField } from 'shared/ResourceForm/fields';
import {
  getPropsFromSchema,
  SchemaOnChangeParams,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { StoreKeys, StoreSchemaType } from '@ui-schema/ui-schema';

type NameRendererProps = {
  storeKeys: StoreKeys;
  resource: {
    kind: string;
  };
  value: string;
  onChange: (params: SchemaOnChangeParams) => void;
  schema: StoreSchemaType;
  required?: boolean;
  editMode?: boolean;
};

export function NameRenderer({
  storeKeys,
  resource,
  value,
  onChange,
  schema,
  required,
  editMode,
}: NameRendererProps) {
  const { t: tExt } = useGetTranslation();
  const extraPaths = schema.get('extraPaths');
  const disableOnEdit = schema.get('disableOnEdit') || false;

  return (
    <K8sNameField
      value={value}
      kind={resource.kind}
      readOnly={editMode && disableOnEdit}
      setValue={(value) => {
        if (extraPaths) {
          onChange([
            {
              storeKeys,
              scopes: ['value'],
              type: 'set',
              schema,
              required,
              data: { value },
            },
            ...extraPaths.map((path: string | (string | number)[]) => ({
              storeKeys: List(
                Array.isArray(path)
                  ? path
                  : jp.parse(path).map((e) => e.expression.value),
              ),
              scopes: ['value'],
              type: 'set',
              schema,
              required,
              data: { value },
            })),
          ]);
        } else {
          onChange({
            storeKeys,
            scopes: ['value'],
            type: 'set',
            schema,
            required,
            data: { value },
          });
        }
      }}
      validate={(value: string) => !!value}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
