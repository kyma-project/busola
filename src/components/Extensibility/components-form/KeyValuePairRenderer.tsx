import { KeyValueField } from 'shared/ResourceForm/fields';
import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import {
  SchemaOnChangeParams,
  useGetTranslation,
} from 'components/Extensibility/helpers';
import { useTranslation } from 'react-i18next';
import {
  getObjectValueWorkaround,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';
import * as Inputs from 'shared/ResourceForm/inputs';
import { Dropdown } from 'shared/ResourceForm/inputs';
import './KeyValuePairRenderer.scss';
import { StoreKeys, StoreSchemaType } from '@ui-schema/ui-schema';

type DropdownCompProps = {
  onChange: (params: { target: { value: string } }) => void;
  setValue: (val: string) => void;
  onBlur: () => void;
  value: any;
  [key: string]: any;
};

const getEnumComponent = (
  enumValues: any,
  isKeyInput: boolean = true,
  input: () => JSX.Element = Inputs.Text,
) => {
  if (!Array.isArray(enumValues)) return input;

  const options = enumValues.map((opt) => ({ key: opt, text: opt }));
  const DropdownComp = ({
    onChange,
    setValue,
    onBlur,
    value,
    ...props
  }: DropdownCompProps) => (
    /*@ts-expect-error Type mismatch between js and ts*/
    <Dropdown
      {...props}
      value={value}
      options={options}
      setValue={(v: string) => {
        if (isKeyInput) {
          onChange({ target: { value: v } });
        } else {
          setValue(v);
        }
        onBlur();
      }}
    />
  );

  return DropdownComp;
};

const getValueComponent = (valueInfo: Record<string, any>) => {
  const { type, keyEnum: valuKeyEnum, valueEnum } = valueInfo || {};

  switch (type) {
    case 'number':
      return getEnumComponent(valueEnum, false, Inputs.Number);
    case 'string':
      return getEnumComponent(valueEnum, false, Inputs.Text);
    case 'object': {
      const FieldComp = ({
        setValue,
        value,
      }: {
        setValue: (val: any) => void;
        value: any;
      }) => (
        <KeyValueField
          className="nested-key-value-pair"
          value={value}
          setValue={(v: any) => {
            setValue(v);
          }}
          input={{
            key: getEnumComponent(valuKeyEnum),
            value: getEnumComponent(valueEnum, false),
          }}
        />
      );
      return FieldComp;
    }
    default:
      return getEnumComponent(valueEnum, false);
  }
};

type KeyValuePairRendererProps = {
  storeKeys: StoreKeys;
  schema: StoreSchemaType;
  value: any;
  onChange: (params: SchemaOnChangeParams) => void;
  required: boolean;
  resource: any;
  nestingLevel?: number;
  editMode?: boolean;
};

export function KeyValuePairRenderer({
  storeKeys,
  schema,
  value,
  onChange,
  required,
  resource,
  nestingLevel = 0,
  editMode,
}: KeyValuePairRendererProps) {
  // TODO the value obtained by ui-schema is undefined for this component
  value = getObjectValueWorkaround(schema, resource, storeKeys, value);

  const disableOnEdit = schema.get('disableOnEdit') || false;
  const disabledKeys =
    disableOnEdit && editMode ? value.keySeq().toArray() : [];

  const { tFromStoreKeys, t: tExt } = useGetTranslation();
  const { t } = useTranslation();

  let titleTranslation = '';
  const path = storeKeys.toArray().join('.');
  const valueInfo = schema.get('value') || {};

  if (tFromStoreKeys(storeKeys, schema) !== path)
    titleTranslation = tFromStoreKeys(storeKeys, schema);
  else if (path === 'metadata.labels')
    titleTranslation = t('common.headers.labels');
  else if (path === 'metadata.annotations')
    titleTranslation = t('common.headers.annotations');

  try {
    value = value ? value.toJS() : {};
  } catch (_error) {
    value = {};
  }

  return (
    <KeyValueField
      nestingLevel={nestingLevel}
      value={value}
      setValue={(value: any) => {
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value: createOrderedMap(value) },
        });
      }}
      input={{
        value: getValueComponent(valueInfo),
        key: getEnumComponent(schema.get('keyEnum')),
      }}
      className="key-enum"
      title={titleTranslation}
      initialValue={valueInfo.type === 'object' ? {} : ''}
      defaultOpen={schema.get('defaultExpanded') ?? false}
      lockedKeys={disabledKeys}
      lockedValues={disabledKeys}
      disableOnEdit={disableOnEdit}
      editMode={editMode}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}
