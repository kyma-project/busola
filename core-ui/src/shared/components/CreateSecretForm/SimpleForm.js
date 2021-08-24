import React from 'react';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { LabelsInput } from 'components/Lambdas/components';
import { FormFieldset, FormLabel, FormInput } from 'fundamental-react';
import { K8sNameInput, Tooltip } from 'react-shared';
import { useTranslation } from 'react-i18next';

export function SimpleForm({ secret, setSecret }) {
  const { t, i18n } = useTranslation();

  return (
    <CreateModal.Section>
      <FormFieldset>
        <CreateModal.FormField
          label={<FormLabel>{t('common.labels.name')}</FormLabel>}
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
                placeholder={t('secrets.create-modal.simple.type-placeholder')}
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
  );
}
