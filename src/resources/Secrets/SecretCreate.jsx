import { useState, useEffect, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';

import { ResourceForm } from 'shared/ResourceForm';
import { DataField } from 'shared/ResourceForm/fields';

import { createSecretTemplate, createPresets, getSecretDefs } from './helpers';

import { useAtomValue } from 'jotai';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { getDescription, SchemaContext } from 'shared/helpers/schema';
import { columnLayoutAtom } from 'state/columnLayoutAtom';

export default function SecretCreate({
  namespace,
  formElementRef,
  onChange,
  resource: initialSecret,
  resourceUrl,
  setCustomValid,
  prefix,
  ...props
}) {
  const { t } = useTranslation();
  const [secret, setSecret] = useState(
    initialSecret || createSecretTemplate(namespace || ''),
  );
  const [initialResource, setInitialResource] = useState(
    initialSecret || createSecretTemplate(namespace || ''),
  );
  const layoutState = useAtomValue(columnLayoutAtom);

  useEffect(() => {
    if (layoutState?.showEdit?.resource) return;

    setSecret(initialSecret || createSecretTemplate(namespace || ''));
    setInitialResource(initialSecret || createSecretTemplate(namespace || ''));
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
    setLockedKeys(currentDef?.data || []);
    setSecret({
      ...secret,
      data: {
        ...(currentDef?.data || []).reduce(
          (acc, key) => ({ ...acc, [key]: '' }),
          {},
        ),
        ...(secret.data || {}),
      },
    });
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const schema = useContext(SchemaContext);
  const dataDesc = getDescription(schema, 'data');

  const onChangeInput = (event, setValue) => {
    const selectedOption = options.find(
      (o) => o.text === event.target.value,
    ) ?? {
      key: event.target._state.filterValue,
      text: event.target._state.filterValue,
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
      presets={!isEdit && createPresets(secretDefs, namespace || '')}
      setCustomValid={setCustomValid}
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
