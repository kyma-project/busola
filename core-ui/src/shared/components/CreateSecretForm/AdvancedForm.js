import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormFieldset, FormLabel } from 'fundamental-react';
import { KeyValueForm } from 'react-shared';

import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { LabelsInput } from 'components/Lambdas/components';
import { SimpleForm } from './SimpleForm';
import { DecodeSecretSwitch } from './DecodeSecretSwitch';

export function AdvancedForm({ secret, setSecret, isEncoded, setEncoded }) {
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
        secret={secret}
        setSecret={setSecret}
        isEncoded={isEncoded}
        setEncoded={setEncoded}
      />

      <CreateModal.Section>
        <FormFieldset>
          <CreateModal.FormField
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
      </CreateModal.Section>
      <CreateModal.Section>
        <FormLabel>{t('secrets.create-modal.simple.data')}</FormLabel>
        {secretDataContent}
      </CreateModal.Section>
    </>
  );
}
