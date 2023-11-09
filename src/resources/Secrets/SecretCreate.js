import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';

import { ResourceForm } from 'shared/ResourceForm';
import { DataField } from 'shared/ResourceForm/fields';

import { createSecretTemplate, createPresets, getSecretDefs } from './helpers';

import { useRecoilValue } from 'recoil';
import { configurationAtom } from 'state/configuration/configurationAtom';

export function SecretCreate({
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
    initialSecret
      ? { ...initialSecret }
      : createSecretTemplate(namespace || ''),
  );
  const [initialUnchangedResource] = useState(initialSecret);

  const [lockedKeys, setLockedKeys] = useState([]);

  const features = useRecoilValue(configurationAtom)?.features;

  const secretDefs = getSecretDefs(t, features);
  const type = secret?.type;
  const currentDef =
    type === 'Opaque' ? {} : secretDefs.find(def => def.type === type);
  const secretTypes = Array.from(
    new Set(secretDefs.map(secret => secret.type || 'Opaque')),
  );
  const options = secretTypes.map(type => ({ key: type, text: type }));

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

  const onChangeInput = (event, setValue) => {
    const selectedOption = options.find(o => o.text === event.target.value) ?? {
      key: event.target._state.filterValue,
      text: event.target._state.filterValue,
    };
    setValue(selectedOption.text);
  };

  return (
    <ResourceForm
      {...props}
      className="create-secret-form"
      pluralKind="secrets"
      singularName={t('secrets.name_singular')}
      resource={secret}
      initialResource={initialSecret}
      initialUnchangedResource={initialUnchangedResource}
      setResource={setSecret}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      presets={!initialSecret && createPresets(secretDefs, namespace || '', t)}
      setCustomValid={setCustomValid}
    >
      <ResourceForm.FormField
        required
        propertyPath="$.type"
        label={t('secrets.type')}
        input={({ value, setValue }) => (
          <div className="fd-col fd-col-md--11">
            <ComboBox
              id="secrets-type-combobox"
              aria-label="Secret's type's Combobox"
              placeholder={t('secrets.placeholders.type')}
              value={options.find(o => o.key === value)?.text ?? value}
              disabled={!!initialSecret || !options?.length}
              onChange={event => onChangeInput(event, setValue)}
              onInput={event => onChangeInput(event, setValue)}
            >
              {options.map(option => (
                <ComboBoxItem id={option.key} text={option.text} />
              ))}
            </ComboBox>
          </div>
        )}
      />
      <DataField
        defaultOpen
        encodable
        propertyPath="$.data"
        lockedKeys={lockedKeys}
      />
    </ResourceForm>
  );
}
SecretCreate.allowEdit = true;
