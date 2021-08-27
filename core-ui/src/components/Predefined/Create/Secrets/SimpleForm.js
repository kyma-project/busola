import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormFieldset, FormLabel, FormInput } from 'fundamental-react';

import { K8sNameInput, Tooltip } from 'react-shared';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { LabelsInput } from 'components/Lambdas/components';

export function SimpleForm({ secret, setSecret }) {
  const { t, i18n } = useTranslation();

  return (
    <>
      <CreateForm.Section>
        <FormFieldset>
          <CreateForm.FormField
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
          <CreateForm.FormField
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
          <CreateForm.FormField
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
      </CreateForm.Section>
    </>
  );
}
