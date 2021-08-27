import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormFieldset, FormLabel, FormInput } from 'fundamental-react';

import { K8sNameInput, Tooltip, KeyValueForm } from 'react-shared';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { LabelsInput } from 'components/Lambdas/components';
import { DecodeSecretSwitch } from './DecodeSecretSwitch';

export function SimpleForm({ secret, setSecret, isEncoded, setEncoded }) {
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
        />
      )}
      i18n={i18n}
    />
  );

  return (
    <>
      <CreateModal.Section>
        <FormFieldset>
          <CreateModal.FormField
            label={<FormLabel required>{t('common.labels.name')}</FormLabel>}
            input={
              <K8sNameInput
                showLabel={false}
                compact
                kind="Secret"
                onChange={e => setSecret({ ...secret, name: e.target.value })}
                value={secret.name}
                i18n={i18n}
              />
            }
          />
          <CreateModal.FormField
            label={
              <FormLabel required>
                {t('secrets.create-modal.simple.type')}
              </FormLabel>
            }
            input={
              <Tooltip content={t('')}>
                <FormInput
                  required
                  compact
                  placeholder={t(
                    'secrets.create-modal.simple.type-placeholder',
                  )}
                  value={secret.type}
                  disabled={true}
                />
              </Tooltip>
            }
          />
          <CreateModal.FormField
            label={<FormLabel>{t('common.headers.labels')}</FormLabel>}
            input={
              <LabelsInput
                showFormLabel={false}
                labels={secret.labels}
                onChange={labels => setSecret({ ...secret, labels })}
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
