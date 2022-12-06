import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboboxInput } from 'fundamental-react';

import { ResourceForm } from 'shared/ResourceForm';
import { DataField } from 'shared/ResourceForm/fields';

import { createSecretTemplate, createPresets, getSecretDefs } from './helpers';

import './SecretCreate.scss';
import { useRecoilValue } from 'recoil';
import { configurationAtom } from 'state/configurationAtom';

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
  const [lockedKeys, setLockedKeys] = useState([]);

  const features = useRecoilValue(configurationAtom)?.features;

  const secretDefs = getSecretDefs(t, features);
  const type = secret?.type;
  const currentDef =
    type === 'Opaque' ? {} : secretDefs.find(def => def.type === type);
  const secretTypes = Array.from(
    new Set(secretDefs.map(secret => secret.type || 'Opaque')),
  );

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

  return (
    <ResourceForm
      {...props}
      className="create-secret-form"
      pluralKind="secrets"
      singularName={t('secrets.name_singular')}
      resource={secret}
      initialResource={initialSecret}
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
            <ComboboxInput
              id="secrets-type-combobox"
              ariaLabel="Secret's type's Combobox"
              required
              compact
              fullWidth
              placeholder={t('secrets.placeholders.type')}
              options={secretTypes.map(type => ({ key: type, text: type }))}
              selectedKey={value}
              typedValue={value}
              onSelect={e => setValue(e.target.value)}
              disabled={!!initialSecret}
            />
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
