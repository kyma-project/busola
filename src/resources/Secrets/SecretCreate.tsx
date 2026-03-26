import { useState, useEffect, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ComboBox,
  ComboBoxDomRef,
  ComboBoxItem,
  Ui5CustomEvent,
} from '@ui5/webcomponents-react';

import { ResourceForm } from 'shared/ResourceForm';
import { DataField } from 'shared/ResourceForm/fields';

import { createSecretTemplate, createPresets, getSecretDefs } from './helpers';

import { useAtomValue } from 'jotai';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { getDescription, SchemaContext } from 'shared/helpers/schema';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { cloneDeep } from 'lodash';
import { ResourceFormProps } from 'shared/ResourceForm/components/ResourceForm';

type SecretCreateProps = {
  namespace?: string;
  resourceUrl?: string;
} & Omit<
  ResourceFormProps,
  | 'pluralKind'
  | 'singularName'
  | 'initialResource'
  | 'updateInitialResource'
  | 'setResource'
  | 'createUrl'
  | 'presets'
>;

export default function SecretCreate({
  namespace,
  formElementRef,
  onChange,
  resource: initialSecret,
  resourceUrl,
  setCustomValid,
  ...props
}: SecretCreateProps) {
  const { t } = useTranslation();
  const [secret, setSecret] = useState(
    initialSecret
      ? cloneDeep(initialSecret)
      : createSecretTemplate(namespace || ''),
  );
  const [initialResource, setInitialResource] = useState(
    initialSecret || createSecretTemplate(namespace || ''),
  );
  const layoutState = useAtomValue(columnLayoutAtom);

  useEffect(() => {
    if (layoutState?.showEdit?.resource) return;

    const timeoutId = setTimeout(() => {
      setSecret(
        cloneDeep(initialSecret) || createSecretTemplate(namespace || ''),
      );
      setInitialResource(
        initialSecret || createSecretTemplate(namespace || ''),
      );
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initialSecret, namespace, layoutState?.showEdit?.resource]);

  const isEdit = useMemo(
    () =>
      !!initialResource?.metadata?.uid && !layoutState?.showCreate?.resource,
    [initialResource, layoutState?.showCreate?.resource],
  );

  const [lockedKeys, setLockedKeys] = useState([]);

  const features = useAtomValue(configurationAtom)?.features;

  const secretDefs = getSecretDefs(t, features);
  const type = secret?.type;
  const currentDef =
    type === 'Opaque' ? {} : secretDefs.find((def) => def.type === type);
  const secretTypes = Array.from(
    new Set(secretDefs.map((secret) => secret.type || 'Opaque')),
  );
  const options = secretTypes.map((type) => ({ key: type, text: type }));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLockedKeys(currentDef?.data || []);
      setSecret({
        ...secret,
        data: {
          ...(currentDef?.data || []).reduce(
            (acc: Record<string, any>, key: string) => ({ ...acc, [key]: '' }),
            {},
          ),
          ...(secret.data || {}),
        },
      });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const schema = useContext(SchemaContext);
  const dataDesc = getDescription(schema, 'data');

  const onChangeInput = (
    event: Ui5CustomEvent<ComboBoxDomRef>,
    setValue: (text: string) => void,
  ) => {
    const selectedOption = options.find(
      (o) => o.text === event.target.value,
    ) ?? {
      key: (event.target as any)._state.filterValue,
      text: (event.target as any)._state.filterValue,
    };
    setValue(selectedOption.text);
  };

  return (
    <ResourceForm
      {...props}
      pluralKind="secrets"
      singularName={t('secrets.name_singular')}
      resource={secret}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setSecret}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      presets={
        (!isEdit && createPresets(secretDefs, namespace || '')) || undefined
      }
    >
      <ResourceForm.FormField
        required
        propertyPath="$.type"
        label={t('secrets.type')}
        input={({ value, setValue }) => (
          <ComboBox
            id="secrets-type-combobox"
            accessibleName="Secret's type's Combobox"
            placeholder={t('secrets.placeholders.type')}
            value={options.find((o) => o.key === value)?.text ?? value}
            disabled={isEdit || !options?.length}
            onChange={(event) => onChangeInput(event, setValue)}
            onInput={(event) => onChangeInput(event, setValue)}
          >
            {options.map((option) => (
              <ComboBoxItem
                key={option.key}
                id={option.key}
                text={option.text}
              />
            ))}
          </ComboBox>
        )}
      />
      <DataField
        defaultOpen
        encodable
        propertyPath="$.data"
        tooltipContent={dataDesc}
        lockedKeys={lockedKeys}
      />
    </ResourceForm>
  );
}
