import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormFieldset, FormLabel } from 'fundamental-react';
import { KeyValueForm } from 'react-shared';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { LabelsInput } from 'components/Lambdas/components';
import { SimpleForm } from './SimpleForm';
import { DecodeSecretSwitch } from './DecodeSecretSwitch';

export function AdvancedForm({
  editMode,
  secret,
  setSecret,
  isEncoded,
  setEncoded,
}) {
  const { t, i18n } = useTranslation();

  const setData = data => {
    setSecret({ ...secret, data });
  };

  const secretDataContent = (
    <KeyValueForm
      data={secret.data}
      setData={setData}
      setValid={() => {}}
      customHeaderAction={(entries, setEntries) => (
        <DecodeSecretSwitch
          entries={entries}
          setEntries={setEntries}
          isEncoded={isEncoded}
          setEncoded={setEncoded}
          i18n={i18n}
        />
      )}
      i18n={i18n}
    />
  );

  return (
    <>
      <SimpleForm
        editMode={editMode}
        secret={secret}
        setSecret={setSecret}
        isEncoded={isEncoded}
        setEncoded={setEncoded}
      />

      <CreateForm.Section>
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel>{t('common.headers.annotations')}</FormLabel>}
            input={
              <LabelsInput
                showFormLabel={false}
                labels={secret.annotations}
                onChange={annotations => setSecret({ ...secret, annotations })}
                i18n={i18n}
                compact
              />
            }
          />
        </FormFieldset>
      </CreateForm.Section>
      <CreateForm.Section>
        <FormLabel>{t('secrets.create-modal.simple.data')}</FormLabel>
        {secretDataContent}
      </CreateForm.Section>
    </>
  );
}
