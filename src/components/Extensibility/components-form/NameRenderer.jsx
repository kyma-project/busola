import { List } from 'immutable';
import jp from 'jsonpath';

import { K8sNameField } from 'shared/ResourceForm/fields';
import {
  getPropsFromSchema,
  useGetTranslation,
} from 'components/Extensibility/helpers';

export function NameRenderer({
  storeKeys,
  resource,
  value,
  onChange,
  schema,
  required,
  editMode,
}) {
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
            ...extraPaths.map((path) => ({
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
      validate={(value) => !!value}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
