import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormFieldset, FormLabel } from 'fundamental-react';

import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { LabelsInput } from 'components/Lambdas/components';
import { SimpleForm } from './SimpleForm';

export function AdvancedForm({ secret, setSecret, isEncoded, setEncoded }) {
  const { t, i18n } = useTranslation();

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
    </>
  );
}
